.DEFAULT_GOAL := dev

COMPOSE := docker compose

.PHONY: dev rebuild build prod down logs shell clean

dev: ## Start the hot-reloading development container.
	$(COMPOSE) up --build

rebuild: ## Remove cached containers/volumes, then rebuild development from scratch.
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) up --build

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
