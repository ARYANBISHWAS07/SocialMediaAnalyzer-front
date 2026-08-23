# Social Media Content Analyzer Frontend

## Overview

Production-ready Next.js frontend for a technical assessment project. The app lets users upload a PDF, PNG, JPG, or JPEG file, sends it to an existing FastAPI backend, and displays extracted text, content metrics, an engagement score, strengths, and improvement suggestions.

## Tech Stack

- Next.js 16
- TypeScript
- App Router
- Tailwind CSS
- Fetch API

## Environment Variables

Create a `.env.local` file from the example:

```bash
cp .env.local.example .env.local
```

Required variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://3.6.187.53:8000
NEXT_PUBLIC_OLLAMA_BASE_URL=http://13.201.129.111:11434
```

## Local Setup

Install dependencies:

```bash
npm install
```

## Running the App

Start the Next.js development server:

```bash
npm run dev
```

Then open the URL printed by Next.js, usually:

```text
http://localhost:3000
```

## Backend Connection Instructions

Run the FastAPI backend before analyzing files. The frontend expects the backend at:

```text
http://3.6.187.53:8000
```

Ollama is available at:

```text
http://13.201.129.111:11434
```

The app uses:

- `GET /api/health` for the backend status indicator
- `POST /api/analyze` with `multipart/form-data` and a `file` field for analysis

The upload request uses `FormData`; the browser sets the multipart boundary automatically.

## Build Command

Create a production build:

```bash
npm run build
```

Run the production server after building:

```bash
npm start
```

## Known Limitations

- No authentication or user accounts.
- No database or persisted upload history.
- Only one file is analyzed at a time.
- Files are validated in the browser for type and a 10 MB maximum size, but the backend should still enforce its own validation.
- Results depend entirely on the FastAPI backend response.
