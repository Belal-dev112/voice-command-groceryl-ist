"""
FastAPI Backend Server for Voice Grocery Assistant
Handles Natural Language Voice Parsing, Google Gemini AI routing, and Catalog queries.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
import urllib.request
import urllib.error

from catalog import CATALOG
from nlp import parse_transcript, get_catalog_summary_for_prompt

app = FastAPI(
    title="Voice Grocery Python Backend",
    description="Natural Language Processing and AI Voice Backend for Smart Grocery Shopping",
    version="1.1.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NLPRequest(BaseModel):
    transcript: str
    apiKey: Optional[str] = None
    lang: Optional[str] = "en-US"
    currentItems: Optional[List[Dict[str, Any]]] = None

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "voice-grocery-python-backend"}

@app.get("/api/catalog")
def get_catalog():
    """Returns the complete store grocery catalog."""
    return {"items": CATALOG, "count": len(CATALOG)}

@app.get("/api/harvest")
def get_harvest(month: Optional[int] = None):
    """Returns all in-season harvest produce for a given month (1-12)."""
    import datetime
    target_month = month or datetime.date.today().month
    in_season = [p for p in CATALOG if target_month in p.get("seasonalMonths", [])]
    return {"month": target_month, "harvest": in_season, "count": len(in_season)}

@app.post("/api/nlp")
async def process_voice_command(payload: NLPRequest):
    """
    Processes voice transcript using Gemini AI if API key is provided,
    otherwise uses the fast offline Python NLP rule-based parser.
    """
    transcript = payload.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    # 1. If user provided a Gemini API key, attempt Gemini AI parsing
    if payload.apiKey:
        try:
            valid_ids = {p["id"] for p in CATALOG}
            prompt = f"""You are the intent parser for a voice shopping list app.
Match the user's request to one of these catalog items when possible (use the id on the left):
{get_catalog_summary_for_prompt()}

Items currently on their list: {json.dumps(payload.currentItems or [])}

Transcript: "{transcript}"

Reply with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:
{{
  "action": "ADD" | "REMOVE" | "SEARCH" | "CLEAR" | "UNKNOWN",
  "matchedProductId": "one of the catalog ids above, or null if no good match",
  "customName": "a short item name if the user asked for something not in the catalog, else null",
  "quantity": 1,
  "query": "search keywords if action is SEARCH, else null",
  "priceMin": null,
  "priceMax": null
}}"""

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={payload.apiKey}"
            req_data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}]
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=6) as response:
                result = json.loads(response.read().decode('utf-8'))
                raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
                cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned_text)

                action = parsed.get("action") if parsed.get("action") in ["ADD", "REMOVE", "SEARCH", "CLEAR"] else "UNKNOWN"
                matched_id = parsed.get("matchedProductId") if parsed.get("matchedProductId") in valid_ids else None
                qty = max(1, min(int(parsed.get("quantity", 1)), 50)) if isinstance(parsed.get("quantity"), (int, float)) else 1

                return {
                    "action": action,
                    "matchedProductId": matched_id,
                    "customName": parsed.get("customName"),
                    "quantity": qty,
                    "query": parsed.get("query"),
                    "priceMin": parsed.get("priceMin"),
                    "priceMax": parsed.get("priceMax"),
                    "engine": "gemini-ai-python"
                }
        except Exception:
            # Fall back seamlessly to rule-based Python NLP
            pass

    # 2. Rule-based Python NLP parser (Fast, 100% offline reliable)
    result = parse_transcript(transcript, payload.lang or "en-US")
    result["engine"] = "rule-based-python"
    return result

if __name__ == "__main__":
    import uvicorn
    print("Starting Voice Grocery Python Backend on http://localhost:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
