FROM debian:bullseye-slim

# Install g++ compiler and cleanup cache
RUN apt-get update && \
    apt-get install -y --no-install-recommends g++ && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create a non-root user for security
RUN useradd -m -s /bin/bash runner && \
    mkdir -p /tmp && \
    chown -R runner:runner /tmp

# Switch to non-root user
USER runner

# Keep the container running indefinitely
# This command prevents the container from exiting immediately after startup
# Need this because the container serves as a persistent environment for code execution
# The container will stay alive and wait for exec commands from application
CMD ["tail", "-f", "/dev/null"]
