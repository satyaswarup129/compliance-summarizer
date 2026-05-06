"""
edgar_fetcher.py
Free SEC EDGAR integration — no API key required.
Just a valid User-Agent header is needed (SEC requirement).
"""

import requests

HEADERS = {
    "User-Agent": "compliance-summarizer-bot contact@yourcompany.com",
    "Accept": "application/json"
}

BASE_EDGAR = "https://efts.sec.gov/LATEST/search-index"
EDGAR_ARCHIVES = "https://www.sec.gov/Archives/edgar/data"


def search_filings(ticker: str, form_type: str = "10-K", limit: int = 5) -> list:
    """
    Search SEC EDGAR full-text search for filings by ticker and form type.
    Returns a list of filing metadata dicts.
    """
    params = {
        "q": ticker,
        "forms": form_type,
        "dateRange": "custom"
    }
    try:
        r = requests.get(BASE_EDGAR, params=params, headers=HEADERS, timeout=10)
        r.raise_for_status()
        hits = r.json().get("hits", {}).get("hits", [])
    except Exception as e:
        print(f"EDGAR search error: {e}")
        return []

    filings = []
    for hit in hits[:limit]:
        src = hit.get("_source", {})
        filings.append({
            "form_type":    src.get("form_type", form_type),
            "file_date":    src.get("file_date", "N/A"),
            "company_name": src.get("display_names", ["Unknown"])[0] if src.get("display_names") else "Unknown",
            "accession_no": src.get("accession_no", ""),
            "cik":          src.get("entity_id", ""),
            "description":  src.get("file_description", ""),
        })
    return filings


def fetch_filing_text(accession_no: str, cik: str, max_chars: int = 50000) -> str:
    """
    Download the full text of a specific SEC filing.
    Returns the first max_chars characters of the document text.
    """
    acc_clean = accession_no.replace("-", "")
    url = f"{EDGAR_ARCHIVES}/{cik}/{acc_clean}/{accession_no}.txt"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return r.text[:max_chars]
    except Exception as e:
        print(f"Filing fetch error: {e}")
        return ""


def get_recent_filings_by_cik(cik: str, form_type: str = "10-K") -> list:
    """
    Fetch recent filings for a company using their CIK number directly.
    """
    url = f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()
        data = r.json()
        recent = data.get("filings", {}).get("recent", {})
        forms = recent.get("form", [])
        dates = recent.get("filingDate", [])
        accessions = recent.get("accessionNumber", [])
        results = []
        for f, d, a in zip(forms, dates, accessions):
            if f == form_type:
                results.append({
                    "form_type": f,
                    "file_date": d,
                    "accession_no": a,
                    "cik": cik,
                    "company_name": data.get("name", "Unknown")
                })
                if len(results) >= 5:
                    break
        return results
    except Exception as e:
        print(f"CIK lookup error: {e}")
        return []
