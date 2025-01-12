FROM oven/bun:latest

WORKDIR /app

# First, copy package files and shared packages
COPY package.json .
COPY ../../packages/shared/ ./packages/shared/

# Install dependencies
RUN bun install

# Then copy the rest of the source code
COPY . .

# Expose the port
EXPOSE 5173

# Start the dev server with host flag
CMD ["bun", "run", "dev", "--", "--host"]
