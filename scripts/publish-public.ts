import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import config from '../obsidian-public.config';

type PublishConfig = {
  vaultPath: string;
  publishTag: string;
  outputDir: string;
  attachmentsDir: string;
  allowedPaths: string[];
};

const ignoredDirs = new Set(['.git', '.obsidian', '.trash', 'node_modules', 'dist', '.astro']);
const markdownExtensionPattern = /\.md$/i;
const obsidianEmbedPattern = /!\[\[([^\]]+)\]\]/g;
const imageExtensionPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const typedConfig = config as PublishConfig;
const rootDir = process.cwd();
const vaultDir = path.resolve(rootDir, typedConfig.vaultPath);
const outputDir = path.resolve(rootDir, typedConfig.outputDir);
const attachmentsDir = path.resolve(rootDir, typedConfig.attachmentsDir);
const shouldPush = process.argv.includes('--push');
const isGitRepo = checkGitRepo();

async function main() {
  await rm(outputDir, { recursive: true, force: true });
  await rm(attachmentsDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await mkdir(attachmentsDir, { recursive: true });

  const files = await findMarkdownFiles(vaultDir);
  const attachmentIndex = await buildAttachmentIndex(vaultDir);
  let publishedCount = 0;
  let attachmentCount = 0;

  for (const file of files) {
    if (isInsideOutputDir(file)) {
      continue;
    }

    const source = await readFile(file, 'utf8');
    const parsed = matter(source);

    if (!hasPublishTag(parsed.data.tags, typedConfig.publishTag)) {
      continue;
    }

    const relativePath = path.relative(vaultDir, file);
    const targetPath = path.join(outputDir, relativePath);
    const rewritten = await rewriteObsidianEmbeds(source, attachmentIndex);

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, rewritten.content);
    publishedCount += 1;
    attachmentCount += rewritten.copiedCount;
  }

  await writeFile(path.join(outputDir, '.gitkeep'), '');
  await writeFile(path.join(attachmentsDir, '.gitkeep'), '');

  console.log(`Prepared ${publishedCount} public note${publishedCount === 1 ? '' : 's'}.`);
  console.log(`Copied ${attachmentCount} attachment${attachmentCount === 1 ? '' : 's'}.`);

  if (!isGitRepo) {
    console.log('Git is not initialized here yet. Run `git init`, add your GitHub remote, then run this command again.');
    process.exitCode = shouldPush ? 1 : 0;
    return;
  }

  await stageAllowedPaths();

  if (shouldPush) {
    commitAndPush();
    return;
  }

  console.log('Review the staged changes, then run `git commit` and `git push`.');
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        continue;
      }

      files.push(...await findMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && markdownExtensionPattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildAttachmentIndex(directory: string): Promise<Map<string, string>> {
  const entries = await readdir(directory, { withFileTypes: true });
  const index = new Map<string, string>();

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name) || isInsideOutputDir(fullPath) || isInsideAttachmentsDir(fullPath)) {
        continue;
      }

      for (const [name, file] of await buildAttachmentIndex(fullPath)) {
        index.set(name, file);
      }

      continue;
    }

    if (entry.isFile() && !markdownExtensionPattern.test(entry.name)) {
      index.set(entry.name, fullPath);
    }
  }

  return index;
}

async function rewriteObsidianEmbeds(source: string, attachmentIndex: Map<string, string>) {
  const copied = new Set<string>();
  const replacements = await Promise.all(
    [...source.matchAll(obsidianEmbedPattern)].map(async (match) => {
      const rawTarget = match[1].trim();
      const [target, alias] = rawTarget.split('|').map((part) => part.trim());
      const attachmentName = path.basename(target);
      const sourcePath = attachmentIndex.get(attachmentName);

      if (!sourcePath) {
        return { original: match[0], replacement: match[0] };
      }

      const publicName = encodePublicFilename(attachmentName);
      const publicPath = path.join(attachmentsDir, publicName);
      const publicUrl = `/attachments/${encodeURIComponent(publicName)}`;
      const label = alias || path.parse(attachmentName).name;

      await copyFile(sourcePath, publicPath);
      copied.add(sourcePath);

      if (imageExtensionPattern.test(attachmentName)) {
        return { original: match[0], replacement: `![${label}](${publicUrl})` };
      }

      return { original: match[0], replacement: `[${label}](${publicUrl})` };
    }),
  );

  let content = source;

  for (const { original, replacement } of replacements) {
    content = content.replace(original, replacement);
  }

  return { content, copiedCount: copied.size };
}

function hasPublishTag(value: unknown, publishTag: string): boolean {
  if (Array.isArray(value)) {
    return value.map(String).includes(publishTag);
  }

  if (typeof value === 'string') {
    return value.split(/[\s,]+/).includes(publishTag);
  }

  return false;
}

function isInsideOutputDir(file: string): boolean {
  const relative = path.relative(outputDir, file);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function isInsideAttachmentsDir(file: string): boolean {
  const relative = path.relative(attachmentsDir, file);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function encodePublicFilename(filename: string): string {
  return filename.replace(/\s+/g, '-').toLowerCase();
}

async function stageAllowedPaths() {
  const existingPaths = [];

  for (const allowedPath of typedConfig.allowedPaths) {
    const absolutePath = path.resolve(rootDir, allowedPath);

    try {
      await stat(absolutePath);
      existingPaths.push(allowedPath);
    } catch {
      continue;
    }
  }

  if (existingPaths.length === 0) {
    return;
  }

  execFileSync('git', ['add', '--', ...existingPaths], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function commitAndPush() {
  const status = execFileSync('git', ['status', '--porcelain'], {
    cwd: rootDir,
    encoding: 'utf8',
  });

  if (!status.trim()) {
    console.log('No public changes to push.');
    return;
  }

  execFileSync('git', ['commit', '-m', 'Publish public notes'], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  execFileSync('git', ['push'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function checkGitRepo(): boolean {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: rootDir,
      stdio: 'ignore',
    });

    return true;
  } catch {
    return false;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
