from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import re
import uuid
import time
from dotenv import load_dotenv

load_dotenv()

from crewai import Crew, Process
from agents import financial_analyst, investment_advisor, risk_assessor
from task import analyze_financial_document, investment_analysis, risk_assessment

DEFAULT_QUERY = os.getenv("DEFAULT_QUERY", "Analyze this financial document for investment insights")
DATA_DIR = os.getenv("DATA_DIR", "data")
API_RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"

app = FastAPI(title="Financial Document Analyzer")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

allowed_origin_regex = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1)(:\\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_crew(query: str, file_path: str):
    """Run analysis crew for trusted PDFs with centralized rate limiting."""
    financial_crew = Crew(
        agents=[financial_analyst, investment_advisor, risk_assessor],
        tasks=[analyze_financial_document, investment_analysis, risk_assessment],
        process=Process.sequential,
        # Keep one limiter at crew level to avoid compounded throttling.
        max_rpm=4,
        verbose=True
    )

    def _extract_retry_seconds(message: str) -> float:
        match = re.search(r"Please try again in\s+([0-9]+(?:\.[0-9]+)?)s", message)
        if not match:
            return 10.0
        return float(match.group(1))

    inputs = {"query": query, "file_path": file_path}
    try:
        return financial_crew.kickoff(inputs=inputs)
    except Exception as exc:
        message = str(exc)
        if "RateLimitError" not in message and "rate_limit_exceeded" not in message:
            raise

        retry_after = _extract_retry_seconds(message)
        # Add a small buffer so retry happens after window reset.
        time.sleep(retry_after + 1.0)
        return financial_crew.kickoff(inputs=inputs)

@app.get("/")
async def root():
    return {"message": "Financial Document Analyzer API is running"}

@app.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    query: str = Form(default=DEFAULT_QUERY)
):
    # Unique ID for this specific upload
    file_id = str(uuid.uuid4())
    os.makedirs(DATA_DIR, exist_ok=True)
    file_path = os.path.join(DATA_DIR, f"{file_id}_{file.filename}")
    
    try:
        # Save uploaded file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Ensure the file is fully written to disk before starting
        time.sleep(1) 
        
        if not query or not query.strip():
            query = DEFAULT_QUERY
            
        # Execute analysis
        response = run_crew(query=query.strip(), file_path=file_path)
        
        return {
            "status": "success",
            "query": query,
            "analysis": str(response),
            "file_processed": file.filename
        }
        
    except Exception as e:
        # Log the full error for debugging
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")
    
    # REMOVED: Immediate file deletion in 'finally' block to prevent 
    # 'Stream ended unexpectedly' errors during async execution.
    # It is safer to clean these files via a background task or cron job.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=API_RELOAD)