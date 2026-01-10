.PHONY: help dev build build-win build-mac build-linux prepare lint format typecheck clean install

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make prepare      - Prepare resources for development"
	@echo "  make build-win    - Build for Windows"
	@echo "  make build-mac    - Build for macOS"
	@echo "  make build-linux  - Build for Linux"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make clean        - Clean build artifacts"

# Install dependencies
install:
	pnpm install

# Development
dev:
	pnpm run dev

# Prepare resources
prepare:
	pnpm run prepare:dev

# Build targets
build-win:
	pnpm run build:win

build-win-dev:
	pnpm run build:win:dev

build-mac:
	pnpm run build:mac

build-mac-dev:
	pnpm run build:mac:dev

build-linux:
	pnpm run build:linux

build-linux-dev:
	pnpm run build:linux:dev

# Code quality
lint:
	pnpm run lint

format:
	pnpm run format

typecheck:
	pnpm run typecheck

# Clean build artifacts
clean:
	rm -rf dist out node_modules/.cache

# Utility
updater:
	pnpm run updater

checksum:
	pnpm run checksum

artifact:
	pnpm run artifact
