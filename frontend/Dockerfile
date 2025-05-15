# Stage 1: Build the Next.js app
FROM node:20 AS builder

WORKDIR /tablemind

# Install pnpm manually
RUN npm install -g pnpm

# Copy dependencies and install only production dependencies
COPY ./tablemind/pnpm-lock.yaml ./tablemind/package.json ./
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the app and build
COPY ./tablemind .
RUN pnpm build

# Stage 2: Run the app
FROM node:20 AS runner

WORKDIR /tablemind

# Copy the standalone output
COPY --from=builder /tablemind/.next/standalone ./
COPY --from=builder /tablemind/public ./public
COPY --from=builder /tablemind/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
