FROM node:16
COPY ./ /app
WORKDIR /app
RUN npm install && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/build /app
COPY nginx.conf /etc/nginx/nginx.conf