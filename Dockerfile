############################
# Base: install dependencies
############################
FROM node:22-alpine AS base
WORKDIR /app

# Only copy what we need to install deps
COPY package.json ./
RUN npm install

############################
# Build: create production bundle
############################
FROM base AS build

COPY . .
RUN npm run build

############################
# Production: serve with Nginx
############################
FROM nginx:stable-alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx listens on 8080 inside the container
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]