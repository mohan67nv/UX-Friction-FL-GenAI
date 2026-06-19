FROM node:22-alpine

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace manifests first to maximize Docker layer cache and ensure
# a correct workspace install.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY dashboard/package.json ./dashboard/package.json

# Install only what the dashboard needs (still uses the workspace lockfile)
RUN pnpm install --no-frozen-lockfile --filter @zerobanner/dashboard...

# Copy the remaining sources
COPY dashboard ./dashboard

# Build args for Supabase (required at build time for Next.js)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE_URL

# Build dashboard with environment variables
RUN pnpm -C dashboard build

EXPOSE 3000
CMD ["pnpm", "-C", "dashboard", "start"]
