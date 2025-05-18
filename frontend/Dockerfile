# Stage 1: Build the Next.js app
FROM node:20 AS builder

WORKDIR /app
RUN npm install -g pnpm

COPY ./frontend/app/pnpm-lock.yaml ./frontend/app/package.json ./
RUN pnpm install --frozen-lockfile

COPY ./frontend/app ./
RUN pnpm build

# Stage 2: Run the app
FROM node:20 AS runner

WORKDIR /app

# Copy the standalone output
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

EXPOSE 5173

CMD ["node", "./build/index.js"]
