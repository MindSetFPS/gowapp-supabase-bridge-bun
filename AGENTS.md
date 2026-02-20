# AGENTS.md - GoWapp Supabase Bridge (Bun)

This document provides guidelines for agentic coding agents working on the GoWapp Supabase Bridge - a Bun-based webhook bridge service.

## Project Overview

This is a lightweight webhook bridge service built with Bun that receives incoming webhook events and processes them. It exposes a REST API endpoint for receiving events and returning appropriate responses.

## Build and Development Commands

### Core Commands
- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun test` - Run test suite (if tests exist)

### Docker Commands
```bash
# Build Docker image
docker build -t webhook-bridge .

# Run container
docker run -d -p 5824:5824 webhook-bridge

# Run with docker-compose
docker-compose up --build
```

### Running Single Tests
```bash
# Run specific test file
bun test path/to/test.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

## Project Structure

```
├── src/
│   └── index.ts          # Main entry point and API handlers
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Dependencies and scripts
└── .dockerignore         # Docker build exclusions
```

## Code Style Guidelines

### TypeScript & Types
- Use TypeScript for all code
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
- Use relative imports for local modules
- Group imports logically (built-ins, third-party, internal)

```typescript
import type { WebhookEvent } from "./types";

const server = Bun.serve({
  port: 5824,
  fetch(request) {
    // handler
  },
});
```

### Naming Conventions
- Functions: camelCase (e.g., `handleWebhook`, `parseRequest`)
- Variables: camelCase with descriptive names
- Constants: UPPER_SNAKE_CASE
- File names: kebab-case or descriptive English

```typescript
const DEFAULT_PORT = 5824;

function parseRequestBody(request: Request): Promise<WebhookEvent> {
  return request.json();
}
```

### Server Configuration
- Use `Bun.serve()` for HTTP server
- Configure port via environment variable with fallback
- Return appropriate status codes

```typescript
const server = Bun.serve({
  port: parseInt(process.env.PORT || "5824"),
  fetch(request) {
    // Handle routes
  },
});
```

### Error Handling
- Return 200 for successful webhook acknowledgments
- Return appropriate error codes (400, 404, 500) for errors
- Log errors for debugging

```typescript
if (!pathMatch) {
  return new Response("Not Found", { status: 404 });
}

try {
  const event = await request.json();
  // Process event
} catch (error) {
  console.error("Error processing webhook:", error);
  return new Response("Bad Request", { status: 400 });
}

return new Response(null, { status: 200 });
```

### API Endpoint Patterns
- Use route parameters for dynamic segments: `/webhook/{business_id}`
- Match HTTP methods explicitly (GET, POST, etc.)
- Return JSON or null responses as appropriate

```typescript
const pathMatch = url.pathname.match(/^\/webhook\/([^/]+)$/);

if (pathMatch && request.method === "POST") {
  const business_id = pathMatch[1];
  // Process webhook
  return new Response(null, { status: 200 });
}
```

## Docker Guidelines

### Dockerfile Structure
- Use multi-stage builds for smaller images
- Use official Bun base images
- Copy only necessary files
- Expose the configured port

```dockerfile
FROM oven/bun:1.3.2-debian AS builder

WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile
COPY src/ ./src/

FROM oven/bun:1.3.2-debian

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

EXPOSE 5824

CMD ["bun", "run", "src/index.ts"]
```

### Docker Compose
- Use version "3.8" for compose file format
- Configure restart policy
- Map ports appropriately

```yaml
version: "3.8"

services:
  webhook-bridge:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5824:5824"
    restart: unless-stopped
```

## Environment Variables

- `PORT` - Server port (default: 5824)

## Dependencies

- Bun runtime (v1.3.2)
- No external npm dependencies required for base functionality

## Development Notes

- This is a minimal Bun server for webhook reception
- The webhook endpoint returns 200 OK immediately after logging the event
- For production, consider adding:
  - Request validation
  - Authentication/verification
  - Async event processing
  - Database integration
  - Proper error responses
