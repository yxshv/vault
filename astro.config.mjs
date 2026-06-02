import { defineConfig } from 'astro/config';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = repoName?.endsWith('.github.io');

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://username.github.io',
  base: process.env.BASE_PATH ?? (repoName && !isUserSite ? `/${repoName}` : undefined),
});
