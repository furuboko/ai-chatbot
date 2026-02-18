.PHONY: help install init dev build start deploy docker-build docker-run db-push studio clean

# Variables
PROJECT_ID ?= your-gcp-project-id
IMAGE_NAME = ai-chatbot
REGION = asia-northeast1
SERVICE_NAME = ai-chatbot

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

init: install ## Initialize project (install + generate Prisma client)
	npx prisma generate
	@echo "✓ Project initialized successfully"
	@echo "Next steps:"
	@echo "  1. Copy .env.example to .env.local and fill in your credentials"
	@echo "  2. Run 'make db-push' to sync Prisma schema with MongoDB"
	@echo "  3. Run 'make dev' to start development server"

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Run production build locally
	npm start

db-push: ## Push Prisma schema to MongoDB
	npx prisma db push

studio: ## Open Prisma Studio
	npx prisma studio

docker-build: ## Build Docker image locally
	docker build -t $(IMAGE_NAME) .

docker-run: ## Run Docker container locally
	docker run -p 8080:8080 --env-file .env.local $(IMAGE_NAME)

deploy-build: ## Build and push Docker image to Google Container Registry
	gcloud builds submit --tag gcr.io/$(PROJECT_ID)/$(IMAGE_NAME)

deploy-run: ## Deploy to Cloud Run
	gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--max-instances 2 \
		--min-instances 0 \
		--memory 512Mi \
		--cpu 1 \
		--timeout 300

deploy: deploy-build deploy-run ## Build and deploy to Cloud Run (full deployment)
	@echo "✓ Deployment completed successfully"

deploy-secrets: ## Deploy with secrets from Secret Manager
	gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--update-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
		--update-secrets DATABASE_URL=database-url:latest \
		--max-instances 2 \
		--min-instances 0 \
		--memory 512Mi \
		--cpu 1 \
		--timeout 300

create-secrets: ## Create secrets in Google Secret Manager
	@echo "Creating secrets in Secret Manager..."
	@read -p "Enter Anthropic API Key: " api_key; \
	echo -n "$$api_key" | gcloud secrets create anthropic-api-key --data-file=- || echo "Secret already exists"
	@read -p "Enter Database URL: " db_url; \
	echo -n "$$db_url" | gcloud secrets create database-url --data-file=- || echo "Secret already exists"

clean: ## Clean build artifacts and node_modules
	rm -rf .next
	rm -rf node_modules
	rm -rf dist
	@echo "✓ Cleaned build artifacts"

test-local: docker-build docker-run ## Test Docker build locally

# Development workflow shortcuts
fresh: clean init ## Fresh install (clean + install + init)
	@echo "✓ Fresh installation completed"

restart: ## Restart development server (useful after schema changes)
	npx prisma generate
	npm run dev
