# Stage 1: Base
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN rm -rf package-lock.json

RUN npm install

# Copy all source code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start dev server and refresh dependencies for mounted workspaces
CMD ["sh", "-lc", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
