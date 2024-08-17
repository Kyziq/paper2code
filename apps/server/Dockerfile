# Use the official Python slim image as the base
FROM python:3.9-slim

# Install black
RUN pip install --no-cache-dir black

# Set the working directory
WORKDIR /code

# Command to format the Python file with black and then execute it
CMD ["sh", "-c", "black \"$1\" && python \"$1\""]
