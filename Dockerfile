# Production image for the Husainiya PCDC ERP (Next.js + Prisma/SQLite).
#
# Two stages: build everything with devDependencies present, then a
# runtime image with production deps only. `prisma migrate deploy` runs
# at container start (not build time) so it applies against whatever
# persistent volume is mounted at runtime — see render.yaml.

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma
# @prisma/client's postinstall runs `prisma generate` against the schema
# copied above, so the client is regenerated for this stage automatically.
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.ts ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p ${PORT:-3000}"]
