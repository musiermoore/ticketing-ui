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

# Start dev server
CMD ["npm", "run", "dev", "--", "--host"]
