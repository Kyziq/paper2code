FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json .
COPY bun.lockb .

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "dev"]
