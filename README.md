# Financial Document Analyzer

AI-powered full-stack application that analyzes financial PDF documents and produces structured, evidence-based financial, investment, and risk insights.

## Live Demo
- Frontend: https://financial-document-analyser.netlify.app/

## Overview
- Frontend: React + Vite (`client/`)
- Backend: FastAPI + CrewAI + Groq LLM (`server/`)
- Input: financial PDF + user query
- Output: consolidated analysis report from a multi-agent workflow

## Project Structure
```text
client/   Frontend app and API client
server/   FastAPI API, CrewAI agents/tasks/tools
README.md Main documentation
```

## Bugs Found And Fixes Applied

1. API routing mismatch between dev/prod
- Symptom: frontend calls failed depending on environment.
- Cause: API URL construction was not robust for proxy and deployed backends.
- Fix: improved `client/src/services/api.js` to:
  - use `VITE_API_BASE_URL` when provided,
  - use same-origin `/analyze` in Vite dev,
  - fallback to local backend for production preview.

2. CORS failures when frontend/backend ran on different hosts
- Symptom: browser blocked `/analyze` requests.
- Cause: strict origin handling.
- Fix: backend CORS now supports configured `ALLOWED_ORIGINS` and regex-based local origins.

3. CrewAI/Groq rate-limit failures
- Symptom: `RateLimitError` and unstable pipeline runs.
- Cause: multi-step calls and repeated document reads increased RPM/TPM pressure.
- Fix:
  - centralized crew limiter (`max_rpm`),
  - retry-after parsing + delayed retry,
  - compact PDF extraction with `PDF_CHAR_LIMIT`,
  - reduced redundant tool usage in downstream tasks.

4. File-processing instability (`Stream ended unexpectedly`)
- Symptom: intermittent backend errors after upload.
- Cause: aggressive file cleanup timing.
- Fix: removed immediate delete-on-finally behavior and stabilized processing flow.

5. UX quality issues during long runs
- Symptom: generic loading feedback and inconsistent form visuals.
- Fix:
  - process-aware loader with active agent + stage status,
  - elapsed timer during analysis,
  - consistent input styling for disabled/readonly state.

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (Node 20 recommended)
- Groq API key

### 1. Backend Setup
```powershell
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env` from `server/.env.example`:
```env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=
DEFAULT_QUERY=Analyze this financial document for investment insights
DATA_DIR=data
API_RELOAD=true
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ALLOWED_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1)(:\\d+)?$
PDF_CHAR_LIMIT=9000
```

Run backend:
```powershell
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```powershell
cd ..\client
npm install
```

Create `client/.env` from `client/.env.example`:
```env
VITE_API_BASE_URL=
VITE_API_ANALYZE_PATH=/analyze
```

Run frontend:
```powershell
npm run dev
```

Open `http://localhost:5173`.

## Usage

1. Open the app in browser.
2. Upload a financial PDF.
3. Enter or keep the default analysis query.
4. Click the run button.
5. Monitor active agent and stage progress.
6. Review structured analysis output.

## API Documentation

Base URL (local): `http://127.0.0.1:8000`

### GET `/`
Health endpoint.

Response:
```json
{"message":"Financial Document Analyzer API is running"}
```

### POST `/analyze`
Analyzes an uploaded PDF using CrewAI workflow.

Request type:
- `multipart/form-data`

Form fields:
- `file` (required): PDF file
- `query` (optional): analysis instruction string

Success response (`200`):
```json
{
  "status": "success",
  "query": "Analyze this financial document for investment insights",
  "analysis": "...agent output...",
  "file_processed": "your_file.pdf"
}
```

Error response (`500`):
```json
{
  "detail": "Error processing document: <message>"
}
```

### Example API call (PowerShell)
```powershell
$filePath = "C:\path\to\document.pdf"
$query = "Analyze growth, profitability, risks, and investment implications"

Invoke-RestMethod -Uri "http://127.0.0.1:8000/analyze" `
  -Method Post `
  -Form @{ file = Get-Item $filePath; query = $query }
```

## Deployment Notes
- Backend can be hosted on Render.
- Frontend can be hosted on Netlify.
- Current live frontend: https://financial-document-analyser.netlify.app/
- For production frontend, set:
  - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`
  - `VITE_API_ANALYZE_PATH=/analyze`
- Update backend `ALLOWED_ORIGINS` to include deployed frontend URL.

## Security Notes
- Never commit real API keys to git.
- Keep `.env` files local and use platform environment variables in production.
- Rotate exposed keys immediately if leaked.
