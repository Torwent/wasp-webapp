### Build Step
FROM node:16.2.0-alpine3.13 AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm ci && npm run build && npm prune --production

### Serve Step
FROM node:16.2.0-alpine3.13
WORKDIR /app
# copy files from previous step
COPY --from=builder /usr/src/app/build .
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/node_modules ./node_modules
# our app is running on port 3000 within the container, so need to expose it
EXPOSE 3000
CMD ["node", "index.js"]