# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy the package.json from the pilot-test-guide subdirectory
COPY pilot-test-guide/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY pilot-test-guide/ .

# Build the Vite application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Create nginx configuration safely as a single long string using echo and single quotes.
# This avoids any Dockerfile heredoc parsing errors on older Docker versions.
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    \
    location / { \
    root   /usr/share/nginx/html; \
    index  index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    \
    # Optional: Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
    root /usr/share/nginx/html; \
    expires 30d; \
    add_header Cache-Control "public, no-transform"; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Default fallback port for Cloud Run
ENV PORT=8080
EXPOSE 8080

# Replace the port dynamically on container startup and then boot Nginx
CMD ["/bin/sh", "-c", "sed -i -e 's/8080/'\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
