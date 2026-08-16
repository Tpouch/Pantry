FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY client/package.json client/pnpm-lock.yaml client/
RUN cd client && pnpm install --frozen-lockfile

COPY client/ client/
RUN cd client && pnpm run build

COPY server/package.json server/pnpm-lock.yaml server/
RUN cd server && pnpm install --frozen-lockfile

COPY server/ server/

FROM node:20-bookworm-slim AS runtime
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/ ./

EXPOSE 3000

CMD ["node", "index.js"]