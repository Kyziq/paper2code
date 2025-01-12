FROM oven/bun:latest

WORKDIR /app

# Copy the source code (only include files within /apps/web)
COPY . .

# Install dependencies
RUN bun install

# Expose the port
EXPOSE 5173

# Start the dev server with host flag
CMD ["bun", "run", "dev", "--", "--host"]
