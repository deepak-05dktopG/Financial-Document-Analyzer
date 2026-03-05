# Financial Document Analyzer

Full-stack AI application that analyzes financial PDF documents and returns structured, evidence-based investment and risk insights.

## Tech Stack
- Frontend: React, Vite, Bootstrap (`client/`)
- Backend: FastAPI, CrewAI, Groq LLM (`server/`)

## Project Structure
```text
client/   React UI and API service client
server/   FastAPI app, Crew agents/tasks/tools
README.md Root documentation
```

## Quick Start (Windows PowerShell)

### 1. Backend
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
```

Run API:
```powershell
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend
```powershell
cd ..\client
npm install
```

Create `client/.env` from `client/.env.example`:
```env
VITE_API_BASE_URL=
VITE_API_ANALYZE_PATH=/analyze
```

Run UI:
```powershell
npm run dev
```

Open `http://localhost:5173`.

## Validation

### Backend health check
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET
```

Expected response includes:
```json
{"message":"Financial Document Analyzer API is running"}
```

### API upload test
```powershell
$filePath = "C:\path\to\your\document.pdf"
$query = "Analyze this financial document for investment insights"

Invoke-RestMethod -Uri "http://127.0.0.1:8000/analyze" `
  -Method Post `
  -Form @{ file = Get-Item $filePath; query = $query }
```

### Frontend production build
```powershell
cd client
npm run build
```

## GitHub Publishing Checklist
- Add secrets only to local `.env` files (never commit them).
- Ensure `client/node_modules`, virtual envs, and generated outputs are ignored.
- Confirm app runs locally (`uvicorn` + `npm run dev`).
- Add repository description and topics on GitHub.
- Optionally add screenshots/gif to improve presentation.

## Create and Push Repository
Run these commands from project root:

```powershell
git init
git add .
git commit -m "Initial commit: financial document analyzer"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
