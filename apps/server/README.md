# Server

A server built with Elysia.js and Bun that performs OCR on images and PDFs, extracts Python code, and executes it in a secure Docker environment.

## 🚀 Features

- Optical Character Recognition (OCR) for images (JPEG, PNG) and PDFs
- Automatic Python code extraction from OCR results
- Secure code execution in isolated Docker containers
- Automatic code formatting and syntax checking
- Google Cloud Vision API integration
- Comprehensive logging system
- Error handling and input validation
- File size and type restrictions

## 📋 Prerequisites

- Bun
- Docker
- Google Cloud Platform account with Vision API enabled

## 🛠️ Setup

1. **Clone the repository and install dependencies**

   ```bash
   cd apps/server
   bun install
   ```
2. **Environment Configuration**
   Create a `.env` file in the project root with the following variables:

   ```env
   GCP_SERVICE_ACCOUNT_KEY_PATH="path/to/your/service-account-key.json"
   GCP_STORAGE_BUCKET_NAME="your_storage_bucket_name"
   GCP_STORAGE_CLASS="STANDARD"
   GCP_STORAGE_LOCATION="ASIA"
   ```
3. **Docker Setup**

   ```bash
   # Start Docker services
   docker compose up -d

   # To stop services
   docker compose down -v --remove-orphans
   ```

## 🚀 Development

Start the development server:

```bash
bun run dev
```

The server will start at `http://localhost:3000`

## 📌 API Endpoints

### POST /api/ocr

Performs OCR on uploaded images or PDFs.

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image (JPG/PNG) or PDF file

**Response:**

```json
{
  "message": "Text extraction successful",
  "data": {
    "uploadedFilePath": "path/to/generated/python/file"
  }
}
```

### POST /api/execute

Executes the generated Python code in a Docker container.

**Request:**

- Content-Type: `application/json`
- Body:

```json
{
  "filePath": "path/to/python/file"
}
```

**Response:**

```json
{
  "message": "File execution successful",
  "data": {
    "output": "Python script output"
  }
}
```

## ⚙️ Configuration

### File Limitations

- Maximum file sizes:
  - Images: 5MB
  - PDFs: 5MB
- Supported file types:
  - Images: JPG, JPEG, PNG
  - Documents: PDF

### Docker Configuration

- Base image: `python:3.9-slim`
- Installed packages:
  - `black` (Python code formatter)
- Volume mapping: `./temp:/code`
- Container name: `python-script-runner`

## 🔒 Security Considerations

1. All code execution happens in isolated Docker containers
2. Temporary files are automatically cleaned up
3. File size and type restrictions are enforced
4. Input validation on all endpoints
5. Error handling prevents sensitive information leakage

## 🐛 Troubleshooting

1. **Docker Issues**

   ```bash
   # Check Docker service status
   docker ps

   # View container logs
   docker logs python-script-runner

   # Restart services
   docker compose restart
   ```
2. **OCR Problems**

   - Verify GCP credentials are correctly configured
   - Check if Vision API is enabled
   - Ensure uploaded files meet size and type requirements
