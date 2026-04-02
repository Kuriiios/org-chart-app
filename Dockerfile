############################
# Base: install dependencies
############################
FROM node:22-alpine AS base
WORKDIR /app

# Only copy what we need to install deps
COPY package.json ./
RUN npm install

############################
# Development: run Vite dev server
############################
FROM base AS development

# Copy the rest of the source code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run dev server; Vite will bind to 0.0.0.0 if configured in package.json
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

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

# Nginx listens on 80 inside the container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]