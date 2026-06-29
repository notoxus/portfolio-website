# Phuoc Thinh — Portfolio

Personal portfolio and technical blog for documenting projects, practical labs, and lessons on cybersecurity, Linux, automation, and software design.

**Live site:** [phuocthinh.is-a.dev](https://phuocthinh.is-a.dev)

## What is included

- A focused homepage with featured work and recent technical blog posts.
- Project entries managed from `content/projects.json`.
- MDX blog posts with syntax highlighting, math, diagrams, and embedded media.
- A GitHub-backed notebook explorer.
- Study Hub for video transcripts, translation, and dictionary lookup.
- Dynamic Open Graph images, RSS, sitemap, robots metadata, and analytics.
- A private GitHub-authenticated admin workflow for editing and publishing content.

## Tech stack

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS 4
- NextAuth with GitHub OAuth
- MDX, KaTeX, Mermaid, and Sugar High
- Vercel Analytics and Speed Insights

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create `.env.local` only for the integrations you need:

```dotenv
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
ADMIN_GITHUB_USERNAME=

GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=

GROQ_API_KEY=
```

Never commit real credentials. The public portfolio can still render without the optional admin and translation integrations.

## Content workflow

- Homepage copy: `content/home-intro.md` and `content/site-settings.json`
- Projects: `content/projects.json`
- Blog posts: `app/blog/posts/*.mdx`
- Social links: `app/components/social-links.tsx`
- SEO metadata: `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`

Authenticated admin pages can update the same content and sync it back to the configured GitHub repository.
The public navigation intentionally hides authentication; open `/api/auth/signin` directly when you need to start an admin session.

## Scripts

```bash
npm run dev    # start the development server
npm run build  # create a production build
npm run start  # serve the production build
```

## Deployment

The site is designed for Vercel. Configure the required environment variables in the deployment project, connect the intended GitHub repository, and deploy the `main` branch.

## License

This repository contains a personal portfolio and its content. Please ask before reusing the written content, branding, or personal assets.
