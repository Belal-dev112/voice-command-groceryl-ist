from http.server import BaseHTTPRequestHandler
import json
import re
import urllib.request

CATALOG_MINIMAL = {
    "milk": "Whole Milk (1L)",
    "almond-milk": "Almond Milk (1L)",
    "paneer": "Fresh Paneer (200g)",
    "eggs": "Farm Eggs (6-pack)",
    "bread": "White Bread",
    "wheat-bread": "Whole Wheat Bread",
    "apples": "Fresh Apples (1kg)",
    "bananas": "Bananas (1 dozen)",
    "watermelon": "Watermelon",
    "tomatoes": "Fresh Tomatoes (1kg)",
    "potatoes": "Potatoes (1kg)",
    "onions": "Red Onions (1kg)",
    "chicken": "Fresh Chicken (500g)",
    "fish": "Fresh Fish Fillet (500g)",
    "rice": "Basmati Rice (1kg)",
    "dal": "Toor Dal (1kg)",
    "pasta": "Penne Pasta (500g)",
    "chai": "Premium Tea Leaves (250g)",
    "coffee": "Instant Coffee (100g)",
    "orange-juice": "Fresh Orange Juice (1L)",
    "water": "Mineral Water (Pack of 6)",
    "chips": "Crispy Potato Chips",
    "chocolate": "Dark Chocolate Bar",
    "ice-cream": "Vanilla Ice Cream Tub (700ml)",
    "frozen-pizza": "Frozen Veg Pizza",
    "dish-soap": "Dishwash Gel (500ml)",
    "paper-towels": "Kitchen Paper Towels (2-roll)",
}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Malformed JSON"}).encode('utf-8'))
            return

        transcript = body.get("transcript", "").strip()
        api_key = body.get("apiKey", "").strip()
        current_items = body.get("currentItems", [])

        if not transcript:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing transcript"}).encode('utf-8'))
            return

        # Attempt Gemini AI parsing if apiKey is provided
        if api_key:
            try:
                catalog_prompt = "\n".join([f"{k}: \"{v}\"" for k, v in CATALOG_MINIMAL.items()])
                prompt = f"""You are the intent parser for a voice grocery shopping list app.
Match the user's request to one of these catalog items when possible:
{catalog_prompt}

Items currently on their list: {json.dumps(current_items)}

Transcript: "{transcript}"

Reply with ONLY a JSON object:
{{
  "action": "ADD" | "REMOVE" | "SEARCH" | "CLEAR" | "UNKNOWN",
  "matchedProductId": "one of the catalog ids above, or null",
  "customName": "item name if not in catalog, else null",
  "quantity": 1,
  "query": "search keywords if SEARCH, else null",
  "priceMin": null,
  "priceMax": null
}}"""

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
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

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(parsed).encode('utf-8'))
                    return
            except Exception:
                pass

        # Fallback offline Python regex parser
        text = transcript.lower()
        action = "ADD"
        if any(w in text for w in ["clear", "empty", "khali", "saaf", "borra"]):
            action = "CLEAR"
        elif any(w in text for w in ["remove", "delete", "hatao", "nikaalo", "quita"]):
            action = "REMOVE"
        elif any(w in text for w in ["search", "find", "dhoondo", "khojo", "busca"]):
            action = "SEARCH"

        qty_match = re.search(r'\b(\d{1,2})\b', text)
        quantity = int(qty_match.group(1)) if qty_match else 1

        matched_id = None
        for pid, name in CATALOG_MINIMAL.items():
            if pid in text or name.lower() in text:
                matched_id = pid
                break

        response_data = {
            "action": action,
            "matchedProductId": matched_id,
            "customName": None if matched_id else re.sub(r'\b(add|buy|need|want|remove|delete|search|find|rupees|rs)\b', '', text).strip(),
            "quantity": quantity,
            "query": text if action == "SEARCH" else None,
            "priceMin": None,
            "priceMax": None,
            "engine": "python-serverless"
        }

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
