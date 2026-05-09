"""
main.py
FastAPI backend for the AI Compliance Document Summarizer.
Run with: uvicorn main:app --reload --port 8000
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from compliance_agent import process_document
from report_generator import generate_report
from edgar_fetcher import search_filings

# ── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Compliance Document Summarizer",
    description="TCS AI Club | Generative AI Capstone 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Storage ──────────────────────────────────────────────────────────────────
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory job store (in production, use Redis or a DB)
jobs: dict = {}


# ── Models ───────────────────────────────────────────────────────────────────
class EDGARRequest(BaseModel):
    ticker: str
    form_type: Optional[str] = "10-K"
    limit: Optional[int] = 5


class JobStatus(BaseModel):
    job_id: str
    status: str          # pending | processing | done | error
    progress: int        # 0–100
    message: str
    result: Optional[dict] = None


# ── Background Processing ────────────────────────────────────────────────────
def run_analysis(job_id: str, pdf_path: str, doc_name: str):
    """Runs in background thread — processes PDF and updates job status."""
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["message"] = "Extracting text and splitting into chunks..."
        jobs[job_id]["progress"] = 10

        raw = process_document(pdf_path)

        jobs[job_id]["progress"] = 70
        jobs[job_id]["message"] = "Deduplicating and generating executive summary..."

        report = generate_report(raw, doc_name)

        jobs[job_id]["status"] = "done"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["message"] = "Analysis complete!"
        jobs[job_id]["result"] = report

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["message"] = str(e)
        jobs[job_id]["progress"] = 0
    finally:
        # Clean up uploaded file
        try:
            os.remove(pdf_path)
        except Exception:
            pass


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Compliance Summarizer API is running ✅"}


@app.post("/upload", response_model=JobStatus)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a PDF compliance document.
    Returns a job_id to poll for results.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}.pdf"

    # Save file
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Register job
    jobs[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
        "message": "Queued for processing...",
        "result": None
    }

    # Start background analysis
    background_tasks.add_task(run_analysis, job_id, str(save_path), file.filename)

    return jobs[job_id]


@app.get("/status/{job_id}", response_model=JobStatus)
def get_status(job_id: str):
    """Poll this endpoint to check analysis progress."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    return jobs[job_id]


@app.get("/result/{job_id}")
def get_result(job_id: str):
    """Retrieve the final report once status == 'done'."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    job = jobs[job_id]
    if job["status"] != "done":
        raise HTTPException(status_code=202, detail=f"Job status: {job['status']}")
    return job["result"]


@app.post("/edgar/search")
def edgar_search(req: EDGARRequest):
    """Search SEC EDGAR for filings by ticker symbol."""
    filings = search_filings(req.ticker, req.form_type, req.limit)
    if not filings:
        raise HTTPException(status_code=404, detail=f"No {req.form_type} filings found for {req.ticker}")
    return {"ticker": req.ticker, "form_type": req.form_type, "filings": filings}


@app.get("/health")
def health():
    return {"status": "ok", "groq_key_set": bool(os.getenv("GROQ_API_KEY"))}
