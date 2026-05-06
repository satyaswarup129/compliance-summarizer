"""
compliance_agent.py
Core AI extraction pipeline for compliance documents.
Uses Groq (free) with LLaMA 3.3 70B model.
"""

import os
import json
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

EXTRACT_PROMPT = """You are a senior compliance analyst reviewing a regulatory document.
Analyze the section below and extract findings. Return ONLY valid JSON with no markdown or extra text.

Use this exact structure:
{{
  "compliance_points": [
    "Write each compliance obligation as a detailed 2-3 sentence explanation. Clearly state what the specific requirement is, which regulation or rule it comes from, and what the organization must do to remain compliant.",
    "..."
  ],
  "risk_areas": [
    "Write each risk as a detailed 2-3 sentence explanation. Describe the nature of the regulatory exposure, why it poses a threat to the organization, and what the potential financial or legal consequences could be.",
    "..."
  ],
  "action_items": [
    "Write each action item as a detailed 2-3 sentence instruction. Specify exactly what must be done, which team or department is responsible for completing it, and the timeframe or triggering condition for the action.",
    "..."
  ],
  "severity": "HIGH"
}}

Rules:
- Severity must be exactly: HIGH, MEDIUM, or LOW
- Every point must be at least 25 words — no short bullet phrases
- Extract only real findings from the text, do not invent information
- If nothing relevant exists in this section, return empty arrays

Document section:
{text}"""


def analyze_section(text: str) -> dict:
    prompt = EXTRACT_PROMPT.format(text=text[:3000])
    response = llm.invoke(prompt)
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"compliance_points": [], "risk_areas": [], "action_items": [], "severity": "LOW"}


def process_document(pdf_path: str) -> dict:
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    chunks = splitter.split_documents(pages)
    chunk_results = []
    for i, chunk in enumerate(chunks):
        print(f"  Analyzing chunk {i+1}/{len(chunks)}...")
        result = analyze_section(chunk.page_content)
        result["page"] = chunk.metadata.get("page", i)
        chunk_results.append(result)
    all_compliance, all_risks, all_actions = [], [], []
    severity_order = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    max_severity = "LOW"
    for r in chunk_results:
        all_compliance.extend(r.get("compliance_points", []))
        all_risks.extend(r.get("risk_areas", []))
        all_actions.extend(r.get("action_items", []))
        sev = r.get("severity", "LOW")
        if severity_order.get(sev, 0) > severity_order.get(max_severity, 0):
            max_severity = sev
    return {
        "raw_chunks": chunk_results,
        "all_compliance": all_compliance,
        "all_risks": all_risks,
        "all_actions": all_actions,
        "overall_severity": max_severity,
        "total_chunks": len(chunks),
        "total_pages": len(pages)
    }