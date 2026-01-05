FROM node:22-alpine

WORKDIR /app

COPY package.json /app/package.json

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN pnpm install --prod=false

COPY . /app

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
