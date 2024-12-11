FROM eclipse-temurin:17-jdk-jammy

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
