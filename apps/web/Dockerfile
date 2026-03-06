FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install
COPY . .
RUN npm run build --workspace @tps/web

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "run", "preview", "--workspace", "@tps/web"]
