.DEFAULT_GOAL := dev

COMPOSE := docker compose

.PHONY: dev nix-dev rebuild clean-rebuild build prod down logs shell clean

dev: ## Start the hot-reloading development container via Docker Compose.
	$(COMPOSE) up --detach --build

nix-dev: ## Start development server natively using Nix Flakes environment.
	nix --extra-experimental-features "nix-command flakes" develop --command bash -c 'pnpm install --frozen-lockfile && pnpm dev'

rebuild: ## Remove cached containers/volumes, then rebuild development from scratch.
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) up --detach --build

clean-rebuild: ## Purge all containers, volumes, and rebuild without layer cache.
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) build --no-cache
	$(COMPOSE) up --detach

build: ## Build the production image without starting it.
	$(COMPOSE) --profile production build web

prod: ## Build and run the production image at http://localhost:3000.
	$(COMPOSE) --profile production up --build web

down: ## Stop containers while preserving dependency and Next.js cache volumes.
	$(COMPOSE) down --remove-orphans

logs: ## Follow development-server logs.
	$(COMPOSE) logs --follow dev

shell: ## Open a shell in the development container.
	$(COMPOSE) exec dev sh

clean: ## Remove containers and all Compose volumes (the next run reinstalls dependencies).
	$(COMPOSE) down --volumes --remove-orphans
