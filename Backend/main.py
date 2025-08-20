from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import os
import uvicorn
from extract_pdf import extract
import json
import random



def extract_pdf(file_path: Optional[str] = None):
    """
    Extract questions from a PDF file.
    This implementation provides a simple stub with sample data. If a valid
    PDF path is passed and a PDF parser is available, you can extend this
    function to perform real extraction.
    """
    logging.info("Starting PDF extraction")
    try:
        os.remove("sample.json")
    except:
        pass
    extract()

    logging.info("PDF extraction completed")
    return 


app = FastAPI(title="Quiz Backend", version="1.0.0")

# Allow all CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def aggregate(count, start, end):
    with open("sample.json", 'r', encoding="utf-8") as f:
        data = json.load(f)
        # Filter questions by page range
        filtered_questions = [
            q for q in data
            if start <= q.get("end_page", 1) <= end
        ]
        # Randomly select 'count' questions
        selected_questions = random.sample(filtered_questions, min(count, len(filtered_questions)))
        return selected_questions


@app.on_event("startup")
def on_startup() -> None:
    logging.basicConfig(level=logging.INFO)
    extract_pdf()


@app.get("/questions")
def get_questions(
    count: int = Query(..., ge=1, description="Number of questions to return"),
    start_page: int = Query(..., ge=1, description="Start page (inclusive)"),
    end_page: int = Query(..., ge=1, description="End page (inclusive)"),
):
    if start_page > end_page:
        raise HTTPException(status_code=400, detail="start_page must be <= end_page")

    questions = aggregate(count, start_page, end_page)
    return questions


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
