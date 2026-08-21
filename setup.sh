#!/usr/bin/env bash

# Exit immediately
set -e

# Color def
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${CYAN}${BOLD}Setting up Portfolio Website Development Environment...${NC}\n"

print_docker_install_hint() {
    echo -e "${YELLOW}Docker Buildx is required because this project's Dockerfile uses BuildKit cache mounts.${NC}"
    echo -e "See ${BOLD}docker-on-linux.md${NC} for installation and troubleshooting."
    if command -v pacman &> /dev/null; then
        echo -e "Install the Docker toolchain with: ${BOLD}sudo pacman -S docker docker-compose docker-buildx${NC}"
    elif command -v apt-get &> /dev/null; then
        echo -e "Install Docker Buildx using your distribution's Docker packages (commonly: ${BOLD}sudo apt-get install docker-buildx-plugin${NC})."
    elif command -v dnf &> /dev/null; then
        echo -e "Install Docker Buildx using your distribution's Docker packages (commonly: ${BOLD}sudo dnf install docker-buildx-plugin${NC})."
    fi
}

check_docker() {
    echo -e "${CYAN}${BOLD}Checking Docker development prerequisites...${NC}\n"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed or is not available in PATH.${NC}"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}Cannot access the Docker daemon.${NC}"
        echo -e "Start Docker, then make sure ${BOLD}docker ps${NC} works without sudo before opening the Dev Container."
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Docker Compose v2 is not available.${NC}"
        exit 1
    fi

    if ! docker buildx version &> /dev/null; then
        print_docker_install_hint
        exit 1
    fi

    echo -e "${GREEN}  ✓ Docker daemon, Compose v2, and Buildx are available.${NC}"
    echo -e "${CYAN}You can now run: ${BOLD}docker compose up --build${NC}\n"
}

if [ "${1:-}" = "--docker" ]; then
    check_docker
    exit 0
fi

if [ "$#" -gt 0 ]; then
    echo "Usage: $0 [--docker]"
    exit 1
fi

# Check dependency:
echo -e "${CYAN}[1/5] Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js (v20 or higher recommended) from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}  ✓ Found Node.js ${NODE_VERSION}${NC}"

echo -e "\n${CYAN}[2/5] Checking pnpm package manager...${NC}"
PNPM_REQUIRED_VERSION="10.14.0"
if command -v corepack &> /dev/null; then
    echo -e "${CYAN}  Activating pnpm ${PNPM_REQUIRED_VERSION} with Corepack...${NC}"
    corepack enable
    corepack prepare "pnpm@${PNPM_REQUIRED_VERSION}" --activate
elif ! command -v pnpm &> /dev/null || [ "$(pnpm -v)" != "${PNPM_REQUIRED_VERSION}" ]; then
    echo -e "${YELLOW}  ! Installing pnpm ${PNPM_REQUIRED_VERSION} globally via npm...${NC}"
    npm install -g "pnpm@${PNPM_REQUIRED_VERSION}"
fi

PNPM_VERSION=$(pnpm -v)
if [ "${PNPM_VERSION}" != "${PNPM_REQUIRED_VERSION}" ]; then
    echo -e "${RED}pnpm ${PNPM_REQUIRED_VERSION} is required; found ${PNPM_VERSION}.${NC}"
    exit 1
fi
echo -e "${GREEN}Found pnpm v${PNPM_VERSION}${NC}"

echo -e "\n${CYAN}[3/5] Checking Git LFS (Large File Storage)...${NC}"
if command -v git-lfs &> /dev/null || git lfs &> /dev/null; then
    git lfs install
    echo -e "${GREEN}Git LFS initialized successfully${NC}"
else
    echo -e "${YELLOW}Git LFS is not installed on this system.${NC}"
fi

# Setup Environment Variables
echo -e "\n${CYAN}[4/5] Checking environment configuration (.env.local)...${NC}"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}Remember to fill in your API keys in .env.local${NC}"
    else
        touch .env.local
        echo -e "${GREEN}Created empty .env.local file${NC}"
    fi
else
    echo -e "${GREEN}.env.local already exists${NC}"
fi

# Install Dependencies
echo -e "\n${CYAN}[5/5] Installing dependencies via pnpm...${NC}"
pnpm install

echo -e "\n${GREEN}${BOLD}Environment setup completed successfully!${NC}"
echo -e "${CYAN}To start the local development server, run:${NC}"
echo -e "  ${BOLD}pnpm dev${NC}\n"
