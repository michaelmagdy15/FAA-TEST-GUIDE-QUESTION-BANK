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

# Use an envsubst template for Cloud Run to dynamically bind to the PORT environment variable.
# We create it safely so nginx's entrypoint script will automatically inject the runtime $PORT variable
# into the configuration file on startup.
RUN cat <<'EOF' > /etc/nginx/templates/default.conf.template
server {
    listen ${PORT};
    server_name localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Optional: Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Default fallback port for Cloud Run
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
