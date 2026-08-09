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
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}  ! pnpm not found. Installing pnpm globally via npm...${NC}"
    npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
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
