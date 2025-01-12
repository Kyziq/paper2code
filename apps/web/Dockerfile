FROM oven/bun:latest

WORKDIR /app

# Copy source code which includes the shared packages
COPY . .

# Install dependencies
RUN bun install

# Expose the port
EXPOSE 5173

# Start the dev server (Vite) with host flag
CMD ["bun", "run", "dev", "--", "--host"]
