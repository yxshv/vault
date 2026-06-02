# Obsidian-to-Astro Public Notes Website Plan

## Goal

Build a clean, minimal static website that publishes selected notes from an Obsidian vault.

Only notes with the `public` frontmatter tag will be published publicly through a GitHub repository using Astro and GitHub Pages.

## Core Idea

The GitHub repository can live inside the Obsidian vault itself, but it should be configured to publish only an explicit allowlist of website files and public notes.

A local command scans the vault, finds markdown files with the `public` tag, stages only the generated public website files, and pushes those files to GitHub Pages.

This avoids needing a separate repository outside the vault, while still keeping private notes out of GitHub.

## Publishing Rule

A note is public only if it has the configured tag in its YAML frontmatter.

Example Obsidian note:

```md
---
title: My Public Note
tags:
  - public
---

This note will be published.
```

Notes without the `public` tag are ignored.

## Proposed Stack

- **Astro** for the static site
- **TypeScript** for project config and local publishing logic
- **Markdown content collections** for public notes
- **Node.js publish script** for collecting public notes and pushing only public files
- **GitHub Actions** for deployment
- **GitHub Pages** for hosting

## Proposed File Structure

```txt
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
├── scripts/
│   └── publish-public.ts
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   └── notes/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── notes/
│   │       └── [...slug].astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── obsidian-public.config.ts
├── package.json
├── README.md
└── PLAN.md
```

## Main Files

### `obsidian-public.config.ts`

Stores local publishing settings.

Expected fields:

```js
export default {
  vaultPath: ".",
  publishTag: "public",
  outputDir: "src/content/notes"
};
```

### `scripts/publish-public.ts`

Responsibilities:

- Recursively scan the configured Obsidian vault
- Read `.md` files
- Parse YAML frontmatter
- Check whether `tags` contains the configured publish tag
- Copy matching files into `src/content/notes`
- Preserve folder structure where practical
- Ignore private notes automatically
- Stage only allowlisted website files
- Push only public website files to GitHub

### `src/content/notes`

Generated public-note content directory.

Only copied, publishable notes should live here.

### `src/content.config.ts`

Astro content collection config for loading public notes from `src/content/notes`.

### `src/pages/index.astro`

Minimal homepage for the public website.

Minimal design:

- Site title
- Short description
- Optional manually curated links later

### `src/pages/notes/[...slug].astro`

Dynamic route for each published note.

Uses Astro markdown rendering.

### `.github/workflows/deploy.yml`

Deploys the Astro site to GitHub Pages whenever changes are pushed to `main`.

Important detail:

The deployment workflow should only receive public website files. The local publish command should prepare and push the public subset from inside the vault.

## Recommended Workflow

1. Write notes normally in Obsidian.
2. Add the `public` tag to notes you want public.
3. Run:

```sh
bun run publish
```

4. The command copies public notes into `src/content/notes`.
5. The command stages only the allowed public website files.
6. Review, commit, and push.
7. GitHub Actions builds the Astro site and publishes it to GitHub Pages.

## Package Scripts

Proposed scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "publish": "tsx scripts/publish-public.ts",
    "publish:push": "tsx scripts/publish-public.ts --push"
  }
}
```

## GitHub Pages Configuration

Astro needs the correct `site` and possibly `base` config depending on the repository type.

### User or organization site

For a repo named:

```txt
username.github.io
```

Astro can use:

```js
export default defineConfig({
  site: "https://username.github.io"
});
```

### Project site

For a repo named:

```txt
my-notes-site
```

Astro should use:

```js
export default defineConfig({
  site: "https://username.github.io",
  base: "/my-notes-site"
});
```

## Privacy Model

Private notes remain private as long as:

- The repository uses a deny-by-default `.gitignore`
- Only Astro project files and generated public notes are allowlisted
- The publish command stages only allowlisted files
- You review `src/content/notes` before pushing
- The publish script only copies notes with the `public` tag
- Attachments are handled carefully before being published

## Attachment Handling

Initial version should keep attachment support simple.

Recommended first version:

- Publish markdown notes only
- Do not automatically copy images or PDFs yet
- Add attachment support later once the basic note publishing flow is working

Future attachment support could:

- Detect linked images like `![[image.png]]`
- Copy matching assets into `public/attachments`
- Rewrite Obsidian image links into web-compatible markdown or HTML

## Design Direction

Clean and minimal:

- White or warm off-white background
- On phones, use a readable max-width content column
- On desktop, keep generous horizontal padding instead of a tightly constrained centered column
- Simple typography
- Fast loading
- No heavy client-side JavaScript
- Mobile-friendly layout

## Open Decisions

Before implementation, decide:

1. What publish tag should be used?
   - Use: `public`

2. Is the GitHub repo a user site or project site?
   - User site: `username.github.io`
   - Project site: any other repo name

3. Should the public notes preserve Obsidian folder structure?
   - Suggested: yes

4. Should attachments be supported in version one?
   - Suggested: no, keep version one markdown-only

## Implementation Phases

### Phase 1: Minimal Astro site

Create a working Astro site with homepage, note pages, and base styling.

### Phase 2: Public-note publishing command

Add the local publish script and config file.

### Phase 3: GitHub Pages deployment

Add GitHub Actions workflow and Astro config for GitHub Pages.

### Phase 4: Polish

Add better metadata, sorting, empty states, and optional attachment support.
