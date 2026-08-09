# Phuoc Thinh — Personal Portfolio Website

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, high-performance personal portfolio and technical blog built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**. 

Feel free to fork and customize this project for your own portfolio!

**Live Site:** [phuocthinh.is-a.dev](https://phuocthinh.is-a.dev) · [Vercel Backup](https://notoxus-morales.vercel.app/)

---

## Features

- **Modern Tech Blog:** Rich MDX posts with syntax highlighting (Sugar High), KaTeX math rendering, and Mermaid diagrams.
- **Project Showcase:** Easily managed project portfolio loaded dynamically via JSON.
- **TipTap Rich-Text Editor:** Embedded admin editor to manage and update site content directly.
- **GitHub OAuth Authentication:** Private admin session powered by `NextAuth.js` v5.
- **GitHub Notebook Explorer:** Integrated viewer linked to [my-note-book repository](https://github.com/notoxus/my-note-book).
- **Integrated Tools (Study Hub):** YouTube video transcript parser, translation, and instant dictionary lookup.
- **Complete SEO & Analytics:** Dynamic OpenGraph images, RSS feed, sitemap.xml, Vercel Analytics & Speed Insights.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling & Motion:** [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database & Sync:** [Neon Postgres](https://neon.tech/) (Serverless), GitHub REST API (`@octokit/rest`)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org/) (GitHub Provider)
- **Content Rendering:** MDX (`next-mdx-remote`), TipTap, KaTeX, Mermaid.js, Sugar High
- **Analytics:** Vercel Analytics & Speed Insights

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **pnpm** installed.
- **Git** & **Git LFS** (Large File Storage) for handling media assets.
- *(Optional)* **VS Code Dev Containers** with Docker Desktop & WSL2 for an isolated setup.

### Installation

#### 🚀 Quick Setup (UNIX users)

You can run the interactive setup script to automatically check Node.js, install `pnpm`, set up `.env.local`, and install all dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

#### 🛠️ Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/notoxus/portfolio-website.git
   cd portfolio-website
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```dotenv
   # NextAuth Configuration
   AUTH_SECRET=your_auth_secret
   AUTH_GITHUB_ID=your_github_client_id
   AUTH_GITHUB_SECRET=your_github_client_secret
   ADMIN_GITHUB_USERNAME=your_github_username

   # GitHub Content Sync & Notebook Integration
   GITHUB_TOKEN=your_personal_access_token
   GITHUB_OWNER=notoxus
   GITHUB_REPO=my-note-book

   # AI / LLM Tools
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

    > **Note for Dev Container users:** If you encounter Git ownership errors (*dubious ownership*) or need Git LFS enabled inside the container, run:
    > ```bash
    > git config --global --add safe.directory /workspaces/portfolio-website
    > git lfs install
    > ```
---

## Content Management Architecture

- **Homepage Info:** `content/home-intro.md` & `content/site-settings.json`
- **Projects List:** `content/projects.json`
- **Blog Posts:** `app/blog/posts/*.mdx`
- **Social Links:** `app/components/social-links.tsx`

> **Note for Admins:** Authenticated users can edit content via the web editor and sync changes back to GitHub. Access `/api/auth/signin` directly to authenticate.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server |
| `pnpm build` | Builds the application for production |
| `pnpm start` | Runs the compiled production build |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and build upon it!
