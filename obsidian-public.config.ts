import path from 'node:path';

export default {
  vaultPath: '/Users/yashverma/Documents/Obsidian Vault',
  publishTag: 'public',
  outputDir: path.join('src', 'content', 'notes'),
  allowedPaths: [
    '.github/workflows/deploy.yml',
    '.gitignore',
    'astro.config.mjs',
    'obsidian-public.config.ts',
    'package.json',
    'package-lock.json',
    'README.md',
    'src',
    'tsconfig.json',
  ],
};
