# base
FROM node:24-alpine AS base

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# dev
FROM base AS development
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# build for prod
FROM base AS build
RUN pnpm build

# prod
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
