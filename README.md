# paper2code

paper2code is a full-stack web application that converts handwritten code from images and PDFs into executable code using OCR (Optical Character Recognition) technology. The application supports multiple programming languages and provides real-time code execution capabilities.

## Features

- **OCR Code Recognition**: Extract code from handwritten images and PDFs
- **Multi-Language Support with Language Detection**:
  - Python
  - Java
  - C++
- **Real-Time Code Execution**: Execute code directly in secure Docker containers
- **Code Enhancement**: AI-powered code formatting and syntax improvement
- **Interactive UI**: Modern, responsive interface with real-time feedback
- **Dark/Light Theme**: Support for both dark and light themes

## Tech Stack

### Backend (Server)

- **Framework**: Bun + Elysia
- **OCR**: Google Cloud Vision API
- **Storage**: Google Cloud Storage
- **Code Execution**: Docker containers
- **AI Enhancement**: Groq API
- **Database**: PostgreSQL with DrizzleORM
- **Testing**: Bun Test Runner

### Frontend (Web)

- **Framework**: React + Vite
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Data Fetching/Caching**: TanStack Query
- **User Interface**: Tailwind CSS with shadcn/ui
- **Code Editor**: CodeMirror
- **Animation**: Motion

## Project Structure

```
paper2code/
├── apps/
│   ├── server/             # Backend application
│   │   ├── src/
│   │   │   ├── config/    # Configuration files
│   │   │   ├── routes/    # API routes
│   │   │   ├── services/  # Business logic
│   │   │   └── utils/     # Utility functions
│   │   └── docker/        # Docker configurations
│   └── web/               # Frontend application
│       └── src/
│           ├── api/       # API client
│           ├── components/ # React components
│           ├── routes/    # Application routes
│           └── stores/    # State management
└── packages/
    └── shared/            # Shared types and utilities
```

## Prerequisites

- Node.js (v18 or higher)
- Bun
- Docker
- Google Cloud Platform account with Vision API enabled
- Groq API account

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Kyziqe/paper2code.git
    cd paper2code
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Setup environments

    ```bash
    # Navigate to server directory
    cd apps/server

    # Setup environment
    cp .env.example .env
    # Configure your .env file with appropriate values

    # Start Docker containers
    docker-compose up -d
    ```

4. Start the development servers

    ```bash
    # Return to root directory
    cd ../..

    # Start both frontend and backend concurrently
    bun dev
    ```
    This will start both the frontend and backend servers simultaneously using Concurrently.

6. Open your browser and navigate to `http://localhost:5173`

## License

See the [LICENSE](LICENSE) file for details.
