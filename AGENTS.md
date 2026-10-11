# AGENTS.md - GoWapp Supabase Bridge

This document provides guidelines for agentic coding agents working on the GoWapp Supabase Bridge - a Node.js/TypeScript webhook bridge service.

## Project Overview

This is a lightweight webhook bridge service built with Node.js and TypeScript that receives incoming webhook events and processes them. It exposes a REST API endpoint for receiving events and returning appropriate responses.

## Build and Development Commands

### Core Commands
- `pnpm dev` - Start development server with hot reload (tsx watch)
- `pnpm build` - Compile TypeScript to `dist/`
- `pnpm start` - Run the compiled server (`node dist/index.js`)
- `pnpm typecheck` - Type-check without emitting output

### Docker Commands
```bash
# Build Docker image
docker build -t webhook-bridge .

# Run container
docker run -d -p 5824:5824 webhook-bridge

# Run with docker-compose
docker compose up --build
```

## Project Structure

```
├── src/
│   ├── index.ts          # HTTP server entry point and routing
│   ├── get-devices.ts    # GoWhatsApp devices API client
│   ├── domain/           # entities and repository interfaces
│   ├── infra/            # Supabase + Dokploy implementations
│   └── routes/           # webhook handlers
├── dist/                 # compiled output (generated, gitignored)
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Code Style Guidelines

### TypeScript & Types
- Use TypeScript for all code (`.ts`)
- Define interfaces for request/response data structures
- Use explicit return types for functions

```typescript
interface WebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

interface WebhookResponse {
  success: boolean;
}
```

### Imports
- Use relative imports for local modules (no file extension)
- Group imports logically (built-ins, third-party, internal)

The project compiles to CommonJS, so extensionless relative imports are correct.

### Naming Conventions
- Functions: camelCase (e.g., `handleWebhook`, `parseRequest`)
- Variables: camelCase with descriptive names
- Constants: UPPER_SNAKE_CASE
- File names: kebab-case or descriptive English

### Server Configuration
- Use `Hono` for routing, served on Node via `@hono/node-server`
- Configure port via environment variable with fallback
- Handlers return a standard `Response`


### Error Handling
- Return 200 for successful webhook acknowledgments
- Return appropriate error codes (400, 404, 500) for errors
- Log errors for debugging


### API Endpoint Patterns
- Use route parameters for dynamic segments: `/webhook/:businessId`
- Register routes per HTTP method (`app.post`, `app.get`, ...)
- Return JSON or null responses as appropriate


## Docker Guidelines

### Dockerfile Structure
- Use multi-stage builds for smaller images
- Use official Node.js base images
- Install pnpm via `corepack enable`
- Copy only necessary files
- Expose the configured port


## Environment Variables

- `PORT` - Server port (default: 5824)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOWAPP_HOST_URL` - Host where the GoWhatsApp containers are exposed; per-business paths (`/api/user/{business_id}/...`) are appended to it
- `GOWAPP_SUPABASE_BRIDGE_URL` - Public URL of this bridge
- `GOWAPP_BASIC_AUTH` - GoWhatsApp basic-auth credentials as `user:password`
- `DOKPLOY_SERVER_URL` - Dokploy server URL
- `DOKPLOY_API_KEY` - Dokploy API key

Locally these are read from `.env` (loaded via `--env-file-if-exists=.env` in the `dev`/`start` scripts). In Docker they are injected via Compose.

## Dependencies

- Node.js (>= 20)
- pnpm (see `packageManager` in `package.json`)
- Development: `typescript`, `tsx`, `@types/node`
- Runtime: `@supabase/supabase-js`, `hono`, `@hono/node-server`
