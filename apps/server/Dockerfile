# Use the official Python slim image as the base
FROM python:3.9-slim

# Install black
RUN pip install --no-cache-dir black

# Create the code directory with proper permissions
RUN mkdir -p /code && chmod 777 /code
