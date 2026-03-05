# Financial Document Analyzer API

FastAPI backend that accepts a PDF and query, then runs CrewAI agents for financial analysis.

## Prerequisites

- Python 3.10+
- A valid `GROQ_API_KEY`

## Setup

```sh
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in `server/` (or copy from `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=
DEFAULT_QUERY=Analyze this financial document for investment insights
DATA_DIR=data
API_RELOAD=true
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Run API

```sh
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## API Endpoints

- `GET /` health/status message
- `POST /analyze` multipart form:
	- `file`: PDF file
	- `query`: text query (optional)

## API Check (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET
```

Expected: status `200` and message that API is running.
