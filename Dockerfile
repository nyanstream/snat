FROM oven/bun:1.3.11-alpine AS base

FROM base AS builder

WORKDIR /build

COPY . .

RUN bun install --frozen-lockfile
RUN bun prisma:generate-client
RUN bun run dist

FROM base AS runner

WORKDIR /snat/dist

COPY --from=builder /build/dist/index.js /snat/dist/
COPY --from=builder /build/dist/index.js.map /snat/dist/
COPY --from=builder /build/dist/cli.js /snat/dist/
COPY --from=builder /build/dist/cli.js.map /snat/dist/
COPY --from=builder /build/public/ /snat/dist/public/

ENV NODE_ENV=production

USER bun
EXPOSE 8000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]
