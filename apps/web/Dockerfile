FROM oven/bun:latest

WORKDIR /app

# Copy entire project for monorepo
COPY . .

# Install dependencies
RUN bun install

# Set the correct working directory
WORKDIR /app/apps/web

# Expose the port
EXPOSE 5173

# Start the dev server with host flag
CMD ["bun", "run", "dev", "--", "--host"]
