"""
report_generator.py
Deduplicates extracted data and generates the final compliance report
using Groq LLM (free). Returns both markdown and structured JSON.
"""

import os
import json
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY")
)


def deduplicate_findings(all_compliance: list, all_risks: list, all_actions: list) -> dict:
    """Use LLM to deduplicate and consolidate repeated findings."""
    if not any([all_compliance, all_risks, all_actions]):
        return {"compliance_points": [], "risk_areas": [], "action_items": []}

    dedup_prompt = f"""Deduplicate and consolidate these compliance findings.
Merge similar items, keep the most specific version of duplicates.
Return ONLY valid JSON with exactly these keys:
{{
  "compliance_points": ["..."],
  "risk_areas": ["..."],
  "action_items": ["..."]
}}

compliance_points: {json.dumps(all_compliance[:25])}
risk_areas: {json.dumps(all_risks[:25])}
action_items: {json.dumps(all_actions[:25])}"""

    try:
        raw = llm.invoke(dedup_prompt).content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception:
        return {
            "compliance_points": list(set(all_compliance))[:10],
            "risk_areas": list(set(all_risks))[:10],
            "action_items": list(set(all_actions))[:10]
        }


def generate_executive_summary(doc_name: str, compliance: list, risks: list, actions: list) -> str:
    """Generate a 4-5 sentence executive summary of the document."""
    exec_prompt = f"""Write a concise 4-5 sentence executive summary for a compliance review of '{doc_name}'.
The summary should highlight the most critical findings for senior management.
Be specific, professional, and action-oriented.

Key compliance obligations: {json.dumps(compliance[:5])}
Main risk areas: {json.dumps(risks[:5])}
Priority actions: {json.dumps(actions[:3])}

Return ONLY the summary paragraph, no bullet points."""

    try:
        return llm.invoke(exec_prompt).content.strip()
    except Exception:
        return f"Compliance review of {doc_name} identified {len(compliance)} obligations, {len(risks)} risk areas, and {len(actions)} required actions. Immediate review by legal counsel is recommended."


def generate_report(analysis_results: dict, doc_name: str) -> dict:
    """
    Main entry point: takes raw analysis results and returns
    a complete structured report as both a dict and markdown string.
    """
    all_c = analysis_results.get("all_compliance", [])
    all_r = analysis_results.get("all_risks", [])
    all_a = analysis_results.get("all_actions", [])
    severity = analysis_results.get("overall_severity", "LOW")

    print("  Deduplicating findings...")
    deduped = deduplicate_findings(all_c, all_r, all_a)

    print("  Generating executive summary...")
    exec_summary = generate_executive_summary(
        doc_name,
        deduped["compliance_points"],
        deduped["risk_areas"],
        deduped["action_items"]
    )

    # Build final structured report
    report = {
        "document_name": doc_name,
        "overall_severity": severity,
        "executive_summary": exec_summary,
        "compliance_points": deduped["compliance_points"],
        "risk_areas": deduped["risk_areas"],
        "action_items": deduped["action_items"],
        "stats": {
            "total_pages": analysis_results.get("total_pages", 0),
            "total_chunks_analyzed": analysis_results.get("total_chunks", 0),
            "compliance_count": len(deduped["compliance_points"]),
            "risk_count": len(deduped["risk_areas"]),
            "action_count": len(deduped["action_items"]),
        }
    }

    report["markdown"] = format_markdown_report(report)
    return report


def format_markdown_report(report: dict) -> str:
    """Format the report as clean markdown."""
    sev = report["overall_severity"]
    sev_emoji = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(sev, "⚪")

    c_list = "\n".join(f"- {x}" for x in report["compliance_points"]) or "- None identified"
    r_list = "\n".join(f"- {x}" for x in report["risk_areas"]) or "- None identified"
    a_list = "\n".join(f"- {x}" for x in report["action_items"]) or "- None identified"
    stats = report["stats"]

    return f"""# Compliance Summary Report
## {report['document_name']}
**Overall Risk Severity:** {sev_emoji} {sev}
**Pages Analyzed:** {stats['total_pages']} | **Chunks Processed:** {stats['total_chunks_analyzed']}

---

## Executive Summary
{report['executive_summary']}

---

## Key Compliance Points ({stats['compliance_count']} found)
{c_list}

---

## Risk Areas ({stats['risk_count']} identified)
{r_list}

---

## Recommended Action Items ({stats['action_count']} items)
{a_list}
"""
