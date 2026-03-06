FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN npm install
COPY . .
RUN npm run build --workspace @tps/api

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "run", "start", "--workspace", "@tps/api"]

