FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose the port
EXPOSE 5173

# Start the development server with host flag
CMD ["npm", "run", "dev", "--", "--host"]
