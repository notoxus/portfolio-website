# Docker on Linux (Arch-based distributions)

This guide sets up Docker Engine, Docker Compose, and Docker Buildx for this project on Arch-based Linux distributions. It works with any editor or terminal workflow; its Dockerfile uses BuildKit cache mounts, so Docker Buildx is required.

## 1. Install Docker

Install the complete CLI toolchain:

```bash
sudo pacman -S docker docker-compose docker-buildx
```

Docker Desktop is optional. The Docker Engine CLI is sufficient for this project.

## 2. Start Docker and grant local access

Enable Docker now and at boot:

```bash
sudo systemctl enable --now docker
```

Allow your regular user to run Docker commands without `sudo`:

```bash
sudo usermod -aG docker "$USER"
```

Then log out and log back in. For a terminal-only temporary session, run:

```bash
newgrp docker
```

The `docker` group grants root-equivalent access to the host. Only add trusted local users to it.

## 3. Verify the installation

All three commands below must succeed without `sudo`:

```bash
docker ps
docker compose version
docker buildx version
```

If `docker ps` reports permission denied, the current desktop session has not received the new group membership yet. Log out completely, log back in, and reopen your editor.

## 4. Run this project

From the project root:

```bash
cp .env.example .env.local
./setup.sh --docker
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) once the development server is ready. Edit `.env.local` to add any credentials needed by the application.

## 5. Use your preferred editor

The Docker workflow above is editor-independent. Use your preferred editor—Neovim, Helix, VS Code, JetBrains IDEs, or another tool—while Docker Compose runs the application.

Useful commands while developing:

```bash
docker compose logs --follow dev
docker compose exec dev sh
docker compose down
```

## 6. Dev Containers (optional)

The provided `.devcontainer/devcontainer.json` uses the same `Dockerfile` as Docker Compose. This workflow requires the **official Microsoft Visual Studio Code build**, because it provides the metadata Dev Containers needs to download the editor server into the container.

Code - OSS, VSCodium, and some distribution-packaged `code` builds can fail with an error such as `serverDownloadUrlTemplate ... cannot be downloaded automatically`. Use the official Visual Studio Code download instead, then install the Dev Containers extension and run **Dev Containers: Rebuild and Reopen in Container**.

The installation source is not the important distinction: an AUR package that repackages Microsoft's official binary may work, while a package built from Code - OSS sources may not. Confirm that the installed editor is the Microsoft Visual Studio Code build if you want the Dev Containers workflow.

Dev Containers remain optional; Docker Compose works with every editor and is all that is required to run or develop this project.

## Docker Hub login

You do not need `docker login` for this project when using public images. Log in only when pulling or pushing a private image.

If login fails with `docker-credential-desktop: executable file not found`, your Docker config is pointing to Docker Desktop's credential helper even though it is not installed. Remove the `"credsStore": "desktop"` entry from `~/.docker/config.json`, or configure a Linux credential helper such as `pass` or `secretservice`, then run `docker login` again.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `the --mount option requires BuildKit` | Docker is using the legacy builder. Install `docker-buildx`, then confirm `docker buildx version`. |
| `permission denied ... /var/run/docker.sock` | Docker is running, but your current user session lacks `docker` group access. Complete step 2, then log out and back in. |
| `docker: command not found` | Install the packages from step 1, then open a new terminal. |
| Dev Container only shows `docker build ... failed` | Run `docker build --target development -t portfolio-debug .` in the project root to see the underlying Dockerfile error directly. |
