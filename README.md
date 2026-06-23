# Nathan Getty — Portfolio

Personal portfolio site, built with [Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com).
Mirrors the [DevPortfolio](https://github.com/RyanFitzgerald/devportfolio) template (MIT) — see `LICENSE.md`.

## Editing content

Almost everything lives in **`src/config.ts`** — name, title, accent color,
social links, about text, skills, projects, experience, and education. Lines
marked `EDIT` are placeholders to replace with your own. Empty out any of the
`projects` / `experience` / `education` arrays to hide that section.

- Change the site-wide accent: `accentColor` (hex) in `src/config.ts`.
- Footer renders the email/linkedin/twitter/github links unconditionally, so
  keep those four populated (or remove their `<a>` blocks in
  `src/components/Footer.astro`).

## Develop locally

Requires Node 18+ (not currently installed on this machine).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to ./dist
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

This repo is `getsec/.github`, GitHub's special profile/community repo. For a
clean `https://getsec.github.io` site, deploy from a repo named
`getsec.github.io`:

1. Create a public repo named exactly **`getsec.github.io`**.
2. Push this project to its `main` branch.
3. In that repo: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
4. The included workflow (`.github/workflows/deploy.yml`) builds with Astro and
   deploys on every push to `main`.
5. Visit `https://getsec.github.io`.

> If you instead deploy from this `.github` repo, the site serves at the
> `getsec.github.io/.github/` subpath — set `base: "/.github"` in
> `astro.config.mjs` to match.

## Credits

Template: [DevPortfolio by Ryan Fitzgerald](https://github.com/RyanFitzgerald/devportfolio) (MIT).
