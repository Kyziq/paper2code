FROM oven/bun:latest

WORKDIR /app

# Copy source code which includes the shared packages
COPY . .

# Install dependencies
RUN bun install

# Expose the port
EXPOSE 3000

# Start the server directly with Bun
CMD ["bun", "run", "dev"]
