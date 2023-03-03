# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# install dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npx pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16 AS builder
WORKDIR /usr/src/app

ARG VITE_SB_URL
ARG VITE_SB_ANON_KEY
ARG SERVICE_USER
ARG SERVICE_PASS
ARG VITE_DEV

ENV NODE_ENV production
ENV VITE_SB_URL $VITE_SB_URL
ENV VITE_SB_ANON_KEY $VITE_SB_ANON_KEY
ENV SERVICE_USER $SERVICE_USER
ENV SERVICE_PASS $SERVICE_PASS
ENV VITE_DEV $VITE_DEV

COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules
RUN npx pnpm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /usr/src/app
RUN adduser -S torwent -D -u 10000 -s /bin/nologin
COPY --from=builder --chown=sveltekit:nodejs /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
USER 10000
EXPOSE 3000
CMD ["node", "./build"]