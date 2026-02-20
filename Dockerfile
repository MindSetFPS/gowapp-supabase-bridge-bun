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
