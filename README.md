# Obsidian Public Site

A minimal Astro + TypeScript site for publishing selected Obsidian notes to GitHub Pages.

## How publishing works

Add the `public` tag to any Obsidian note you want to publish:

```md
---
title: Example Note
tags:
  - public
---

Your public note content.
```

Then run:

```sh
bun run publish
```

The publish command copies public notes into `src/content/notes` and stages only allowlisted website files.

Obsidian embeds like `![[image.png]]` are copied into `public/attachments` and rewritten to normal Markdown image links.

Review the staged changes before committing:

```sh
git status
git diff --cached
```

Then commit and push:

```sh
git commit -m "Publish public notes"
git push
```

Or prepare, commit, and push in one command:

```sh
bun run publish:push
```

## Setup

Install dependencies:

```sh
bun install
```

Start local development:

```sh
bun run dev
```

Build locally:

```sh
bun run build
```

## GitHub Pages

In your GitHub repository settings, set Pages source to GitHub Actions.

For a project site, Astro automatically uses the repository name as the base path in GitHub Actions.

For a custom URL, set the `SITE_URL` environment variable in `.github/workflows/deploy.yml`.

## Privacy

This repo is designed to be used inside an Obsidian vault.

The `.gitignore` file denies everything by default and allowlists only the website files. Still, always review staged changes before committing.
