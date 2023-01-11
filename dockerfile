# stage-1

FROM node:14-alpine3.14 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# stage -2

FROM nginx:alpine
COPY --from=builder /app/dist/case-itau-front /usr/share/nginx/html