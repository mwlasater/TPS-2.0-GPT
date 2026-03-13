FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace @tps/web

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/dist ./apps/web/dist
RUN npm install -g serve
CMD ["serve", "-s", "apps/web/dist", "-l", "4173"]
