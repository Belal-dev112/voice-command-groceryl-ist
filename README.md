# 🛒 Voice Grocery — Voice-Controlled Shopping Assistant

An intelligent, voice-first grocery shopping platform built with a **Python Backend (FastAPI / NLP)** and a modern **React Frontend**. It understands natural conversational voice commands in **English, Hindi (हिंदी), and Spanish (Español)**, auto-categorizes items, handles Indian Rupee (Rs.) pricing, detects in-season harvests, and integrates Google Gemini AI with seamless offline rule-based fallbacks.

🔗 **Live Demo:** [https://voice-command-groceryl-ist.vercel.app](https://voice-command-groceryl-ist.vercel.app)

---

## 🏗️ Architecture & Interview Talking Points

### 1. Backend Architecture (Python 3 & FastAPI)
- **Framework:** Python 3 + FastAPI (`backend/main.py`)
- **Natural Language Processing (`backend/nlp.py`):**
  - **Rule-Based Engine:** Fast, zero-latency dictionary and regex pattern matching supporting English, Hindi, and Spanish intent resolution (`ADD`, `REMOVE`, `SEARCH`, `CLEAR`).
  - **Multilingual Tokenizer & Alias Matcher:** Normalizes accents (Unicode NFD decomposition) and matches multi-word transliterated phrases (e.g. *"doodh"*, *"tamatar"*, *"leche"*).
  - **Price Extraction:** Regular expressions tuned for Indian Rupees (`"under Rs. 50"`, `"50 se kam"`, `"between 50 and 100 rupees"`).
  - **LLM Integration (Optional AI Mode):** Integrates Google Gemini (`gemini-1.5-flash`) via Python REST client. If the API key is missing or rate-limited, it silently falls back to Python's offline rule-based parser.
- **Serverless API (`api/nlp.py`):** Deployed as a Python serverless endpoint for zero-cold-start cloud execution.

### 2. Frontend Architecture
- **Framework:** Next.js / React with Tailwind CSS.
- **Audio & Speech Engine:** HTML5 Web Speech API (`webkitSpeechRecognition` and `SpeechSynthesis`) for real-time speech-to-text and audio feedback.
- **State Management:** Reactive Store with browser `localStorage` persistence.

---

## ✨ Features

- 🎙️ **Multilingual Voice Commands:** Natural voice recognition in English, Hindi, and Spanish.
- 🏪 **Interactive Market Catalog:** Browse all 27 grocery items with real-time Indian Rupee (Rs.) prices, category filters, and instant search.
- 🌾 **Seasonal Harvest Tracker:** Automatically calculates and lists fresh farm produce in season for the current month.
- 📦 **Smart Auto-Categorization & Custom Items:** Items automatically group into Produce, Dairy & Eggs, Bakery, Pantry, etc. Unrecognized items default to **Miscellaneous**.
- 🔄 **Smart Recommendations:** Restock alerts based on purchase frequency and automatic out-of-stock substitutes (e.g., Whole Milk → Almond Milk).
- 🍏 **Editorial Design:** Forest green botanical aesthetic, stone pill cards, and a floating Dynamic Island voice control bar.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | **Python 3**, **FastAPI**, **Pydantic** | REST API, NLP Intent Engine & AI routing |
| **AI / NLP** | **Regex / Dictionary NLP** + **Google Gemini** | Natural language phrase understanding |
| **Frontend** | **React**, **Next.js**, **Tailwind CSS** | Responsive UI & client state |
| **Voice** | **Web Speech API** | Browser-native speech recognition & TTS |
| **Deployment** | **Vercel** (Python Serverless + Next.js) | Production hosting |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Belal-dev112/voice-command-groceryl-ist.git
cd voice-command-groceryl-ist
```

### 2. Run the Python Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*The FastAPI backend will start at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

### 3. Run the Frontend
```bash
npm install
npm run dev
```
*Open `http://localhost:3000` in Chrome or Edge and allow microphone permissions.*

---

## 🎤 Example Voice Commands

| Intent | Example Commands |
|---|---|
| **Add item** | *"Add 2 apples"*, *"I need whole milk"*, *"Buy potato chips"* |
| **Remove item** | *"Remove bread"*, *"Delete apples from my list"* |
| **Price search** | *"Find snacks under Rs. 50"*, *"Show me items under 100 rupees"* |
| **Clear list** | *"Clear my list"*, *"Empty cart"* |
| **Hindi (हिंदी)** | *"दूध जोड़ो"*, *"दो सेब चाहिए"*, *"50 रुपये से कम के स्नैक्स दिखाओ"* |
| **Spanish (Español)** | *"Añade dos manzanas"*, *"Necesito pan"*, *"Busca aperitivos"* |

---

## 📁 Repository Structure

```
├── backend/                       # Python Backend
│   ├── main.py                    # FastAPI server & route handlers
│   ├── nlp.py                     # Python Multilingual NLP Engine
│   ├── catalog.py                 # Grocery catalog & Rs. prices in Python
│   └── requirements.txt           # Python dependencies (FastAPI, uvicorn, pydantic)
├── api/
│   └── nlp.py                     # Python serverless handler for cloud deployment
├── src/
│   ├── app/
│   │   ├── globals.css            # Botanical design system & styling
│   │   ├── layout.tsx             # Root layout & typography
│   │   └── page.tsx               # Main grocery application & tabs
│   ├── components/                # React UI components
│   └── data/                      # Client-side data definitions
├── vercel.json                    # Deployment config
└── package.json
```

---

## 📄 License
MIT License. Open source and free to use.
