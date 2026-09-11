# Phuoc Thinh — Personal Portfolio Website

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, high-performance personal portfolio and technical blog built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**. 

Feel free to fork and customize this project for your own portfolio!

**Live Site:** [phuocthinh.is-a.dev](https://phuocthinh.is-a.dev) · [notoxus-morales.vercel.app](https://notoxus-morales.vercel.app/)

---

## Features

- **Modern Tech Blog:** Rich MDX posts with syntax highlighting (Sugar High), KaTeX math rendering, and Mermaid diagrams.
- **Project Showcase:** Easily managed project portfolio loaded dynamically via JSON.
- **TipTap Rich-Text Editor:** Embedded admin editor to manage and update site content directly.
- **GitHub OAuth Authentication:** Private admin session powered by `NextAuth.js` v5.
- **GitHub Notebook Explorer:** Integrated viewer linked to [my-note-book repository](https://github.com/notoxus/my-note-book).
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

- **Docker Engine**, Docker Compose v2, and Docker Buildx (recommended). The Dockerfile uses BuildKit cache mounts, so the legacy Docker builder is not supported. See the [Docker on Linux guide](docker-on-linux.md) for installation and troubleshooting. No Node.js, pnpm, or VS Code installation is required for this path.
- **Git** for cloning the repository.
- *(Optional)* [Nix](https://nixos.org/) with Flakes enabled — for a fully reproducible native dev environment without Docker.
- *(Optional)* Node.js 24.x and pnpm 10.14.0 for running outside Docker/Nix.

### Installation

#### 🐳 Docker (recommended)

1. Install and verify Docker by following the [Docker on Linux guide](docker-on-linux.md). It covers Docker Buildx, daemon permissions, and an editor-independent Compose workflow.
2. Run the project's Docker preflight:
   ```bash
   ./setup.sh --docker
   ```
3. Create the local environment file once:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add the credentials you need.
   ```
4. Start a hot-reloading development container:
   ```bash
   docker compose up --build
   # or: make
   ```
   Open [http://localhost:3000](http://localhost:3000). Source code remains on your machine; dependencies and the Next.js cache live in Docker volumes.

The usual Docker workflow:

| Command | Purpose |
| :--- | :--- |
| `docker compose up --build` / `make dev` | Build when needed and start development with hot reload |
| `make rebuild` | Fully recreate the development environment, including dependency/cache volumes |
| `make clean-rebuild` | Purge all containers, volumes, and rebuild without Docker layer cache |
| `make shell` | Open a shell in the running development container |
| `make prod` | Build and run the small standalone production image |
| `make down` | Stop containers while keeping Docker caches |
| `make clean` | Stop containers and remove the Docker caches |

`make rebuild` is the clean reset to use after changing the Dockerfile, Node/pnpm version, or dependency lockfile. It intentionally removes only this project's named Compose volumes, never your source checkout.

> **BuildKit troubleshooting:** See [Docker on Linux](docker-on-linux.md#troubleshooting) if a Docker build or Dev Container fails.

> **Dev Containers:** This optional workflow requires the official Microsoft Visual Studio Code build. See [Docker on Linux](docker-on-linux.md#6-dev-containers-optional) for the reason and compatible editor builds.

#### ❄️ Nix Flakes (native, reproducible)

A [`flake.nix`](flake.nix) is provided for a fully reproducible native development environment. It pins Node.js 24, pnpm (via Corepack), Git, Docker, and Docker Compose — no global installs needed.

1. **Install Nix** (if not already installed):
   ```bash
   # Arch Linux
   sudo pacman -S nix
   sudo systemctl enable --now nix-daemon.service
   sudo nix-store --init   # one-time store initialization

   # Other distros / macOS — use the official installer:
   # https://nixos.org/download
   ```

2. **Enable Flakes** (add to `~/.config/nix/nix.conf`):
   ```ini
   experimental-features = nix-command flakes
   ```

3. **Start developing:**
   ```bash
   make nix-dev
   ```
   This enters the Nix devShell, installs dependencies with `pnpm install --frozen-lockfile`, and starts the Next.js dev server.

4. *(Optional)* **[direnv](https://direnv.net/) auto-activation:**
   An `.envrc` file is included. If you use `direnv`, the Nix environment activates automatically when you `cd` into the project:
   ```bash
   direnv allow
   ```

> **Note:** The first run downloads the Nix derivations (~1–2 min). Subsequent runs are instant.

#### 🚀 Quick Setup without Docker (UNIX users)

You can run the interactive setup script to automatically check Node.js, install `pnpm`, set up `.env.local`, and install all dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

To check the Docker prerequisites instead, run:

```bash
./setup.sh --docker
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

   ```

4. **Run the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

   > **Optional Dev Container:** It builds from the same `Dockerfile` as Compose, but the Docker workflow above does not require VS Code.
   
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
| `make dev` | Start hot-reloading dev container (Docker) |
| `make nix-dev` | Start dev server via Nix Flakes (native, reproducible) |
| `make rebuild` | Recreate Docker environment with fresh volumes |
| `make clean-rebuild` | Full Docker purge + rebuild without layer cache |
| `make prod` | Build and run the production image |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and build upon it!
