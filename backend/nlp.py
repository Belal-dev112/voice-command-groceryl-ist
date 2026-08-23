"""
NLP Module for Voice Grocery Backend (Python)
Provides multilingual intent parsing, catalog matching, quantity extraction,
and optional Google Gemini AI processing.
"""

import re
import json
import unicodedata
from typing import Optional, Dict, Any, List
from catalog import CATALOG, find_product_by_id

# 1. Intent Keywords per Language
INTENTS = {
    "CLEAR": {
        "en-US": ["clear my list", "clear the list", "empty my list", "empty the list", "start over", "clear cart", "delete everything"],
        "hi-IN": ["सूची खाली करो", "list khali karo", "list saaf karo", "sab hatao", "puri list hatao"],
        "es-ES": ["vacía la lista", "borra la lista", "limpia la lista"],
    },
    "REMOVE": {
        "en-US": ["remove", "delete", "take off", "get rid of", "don't need"],
        "hi-IN": ["हटाओ", "hatao", "nikaalo", "निकालो", "kam karo"],
        "es-ES": ["quita", "elimina", "borra", "no necesito"],
    },
    "SEARCH": {
        "en-US": ["find", "search for", "search", "look for", "show me", "is there", "items under", "snacks under"],
        "hi-IN": ["ढूंढो", "dhoondo", "khojo", "खोजो", "dikhao", "दिखाओ"],
        "es-ES": ["busca", "encuentra", "muéstrame"],
    },
    "ADD": {
        "en-US": ["add", "buy", "i need", "i want", "get me", "get", "put", "grab", "purchase"],
        "hi-IN": ["जोड़ो", "jodo", "चाहिए", "chahiye", "khareedo", "खरीदो", "lao", "लाओ"],
        "es-ES": ["añade", "agrega", "necesito", "quiero", "compra"],
    }
}

NUMBER_WORDS = {
    "en-US": {
        "one": 1, "a": 1, "an": 1, "two": 2, "to": 2, "too": 2, "three": 3,
        "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
    },
    "hi-IN": {
        "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5, "panch": 5,
        "chhah": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10
    },
    "es-ES": {
        "un": 1, "una": 1, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
        "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10
    }
}

def normalize(text: str) -> str:
    """Lowercase and strip punctuation."""
    return re.sub(r'[.,!?]', '', text.lower().strip())

def strip_accents(text: str) -> str:
    """Normalize unicode and remove accents."""
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

def extract_quantity(text: str, lang: str = "en-US") -> int:
    """Extract numeric or worded quantity from text."""
    digit_match = re.search(r'\b(\d{1,2})\b', text)
    if digit_match:
        qty = int(digit_match.group(1))
        if 0 < qty <= 50:
            return qty
            
    words = text.split()
    lang_dict = NUMBER_WORDS.get(lang, NUMBER_WORDS["en-US"])
    for w in words:
        if w in lang_dict:
            return lang_dict[w]
    return 1

def extract_price_filter(text: str) -> Optional[Dict[str, float]]:
    """Extract Indian Rupee price constraints (min, max)."""
    # "between Rs 50 and Rs 100" / "between 50 and 100 rupees"
    between = re.search(r'between\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)\s*(?:and|to)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)', text, re.I)
    if between:
        return {"min": float(between.group(1)), "max": float(between.group(2))}

    # "under Rs 100" / "below 50 rupees" / "less than 50" / "50 se kam"
    under = re.search(r'(?:under|below|less than|se kam|kam)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)(?:\s*(?:rupees|rs|rupaye))?', text, re.I)
    if under:
        return {"max": float(under.group(1))}

    # "over Rs 50" / "more than 100" / "above 100"
    over = re.search(r'(?:over|above|more than|se zyada|zyada)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)(?:\s*(?:rupees|rs|rupaye))?', text, re.I)
    if over:
        return {"min": float(over.group(1))}

    return None

def detect_intent(text: str, lang: str = "en-US") -> str:
    """Determine the user's intent action: ADD, REMOVE, SEARCH, or CLEAR."""
    for action, lang_map in INTENTS.items():
        keywords = lang_map.get(lang, []) + lang_map.get("en-US", [])
        if any(kw in text for kw in keywords):
            return action
    return "ADD"

def match_product(text: str, lang: str = "en-US") -> Optional[Dict[str, Any]]:
    """Match transcript text to product aliases in the catalog."""
    normalized_text = strip_accents(text.lower())
    best_product = None
    max_len = 0

    for product in CATALOG:
        aliases = product["aliases"].get(lang, []) + product["aliases"].get("en-US", [])
        for alias in aliases:
            norm_alias = strip_accents(alias.lower())
            if norm_alias in normalized_text:
                if len(norm_alias) > max_len:
                    max_len = len(norm_alias)
                    best_product = product

    return best_product

def strip_known_words(text: str, lang: str = "en-US") -> str:
    """Remove filler words and intent keywords to isolate item names."""
    result = text
    for action, lang_map in INTENTS.items():
        keywords = lang_map.get(lang, []) + lang_map.get("en-US", [])
        for kw in keywords:
            result = result.replace(kw, " ")
    result = re.sub(r'\b(to|the|my|list|from|for|please|some|a|an|of|rupees|rs|rupaye)\b', ' ', result, flags=re.I)
    return re.sub(r'\s+', ' ', result).strip()

def parse_transcript(raw_transcript: str, lang: str = "en-US") -> Dict[str, Any]:
    """Parse transcript using rule-based Python NLP."""
    text = normalize(raw_transcript)
    action = detect_intent(text, lang)
    quantity = extract_quantity(text, lang)
    price_filter = extract_price_filter(text)
    matched_product = match_product(text, lang)

    custom_name = None
    query = None

    if action == "SEARCH":
        query = strip_known_words(text, lang)
    elif not matched_product and action in ["ADD", "REMOVE"]:
        leftover = re.sub(r'\b\d+\b', '', strip_known_words(text, lang)).strip()
        if len(leftover) > 0:
            custom_name = leftover

    return {
        "action": action,
        "matchedProductId": matched_product["id"] if matched_product else None,
        "matchedProduct": matched_product,
        "customName": custom_name,
        "quantity": quantity,
        "query": query,
        "priceMin": price_filter["min"] if price_filter and "min" in price_filter else None,
        "priceMax": price_filter["max"] if price_filter and "max" in price_filter else None,
        "rawTranscript": raw_transcript,
    }

def get_catalog_summary_for_prompt() -> str:
    """Generate prompt summary of catalog for LLMs."""
    return "\n".join([f"{p['id']}: \"{p['name']}\" ({p['category']}, Rs. {p['price']})" for p in CATALOG])
