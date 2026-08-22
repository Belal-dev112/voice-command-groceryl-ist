# Voice List — Voice Command Shopping Assistant

A voice-controlled shopping list that understands flexible phrasing in
**English, Hindi, and Spanish**, gives smart/seasonal/substitute suggestions,
and runs entirely in the browser — no backend, no API keys, no rate limits.

## Live features → assignment requirements

| Assignment requirement | Where it lives |
|---|---|
| Voice command recognition | `VoiceButton.tsx` (Web Speech API) |
| NLP for varied phrasing | `lib/nlp.ts` — keyword + alias matching, not rigid regex |
| Multilingual voice input | `lib/nlp.ts` dictionaries + language picker in `VoiceButton.tsx` |
| Product recommendations / "running low" | `lib/suggestions.ts` → `getRestockSuggestions` |
| Seasonal recommendations | `lib/suggestions.ts` → `getSeasonalSuggestions` |
| Substitutes when out of stock | `data/catalog.ts` (`substituteId`) + `getSubstituteSuggestions` |
| Add / remove / modify by voice | `lib/store.tsx` + `lib/nlp.ts` |
| Auto-categorization | Every `Product` has a fixed `category`; custom items default to "Miscellaneous" |
| Quantity by voice ("2 bottles of water") | `extractQuantity()` in `lib/nlp.ts` |
| Voice search + price filtering | `SearchResults.tsx` + `extractPriceFilter()` |
| Minimalist UI, visual feedback | Single-column chalkboard-styled list, live feedback bubble under the mic |
| Loading states | Spinner while parsing, spinner on initial list load |
| Mobile / voice-first | Fixed bottom mic button, responsive single-column layout |

## Why no paid AI API — and how the optional AI mode works

The app ships with a rule-based NLP engine (`src/lib/nlp.ts`) as its
**default and always-available** path: dictionaries of intent words and item
aliases per language, plus regex for quantities and prices. Zero setup,
never fails, works offline.

On top of that, there's an **optional AI mode**: open the settings gear in
the header and paste a free Gemini API key (get one at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) — no
credit card required for the Flash/Flash-Lite free tier). When a key is
present, each voice command is first sent to `/api/nlp`
(`src/app/api/nlp/route.ts`), a server route that calls Gemini for richer
phrase understanding and only that request round-trip. If the key is
missing, invalid, rate-limited, or the request times out (6s) or fails for
any reason, the app **silently falls back** to the offline parser — the
user never sees an error, they just get a slightly less flexible match.

The key is stored only in the browser's `localStorage` and sent only to
your own `/api/nlp` route, which forwards it only to Google — it is never
committed to the repo or hardcoded anywhere.

**A word of caution if you go looking for a key elsewhere:** don't use API
keys posted in public GitHub repos or key-sharing lists. Those are almost
always leaked/stolen credentials (which Google actively revokes within
hours) or a way to get you to paste secrets into a compromised project.
Get your own free key directly from Google AI Studio — it takes under a
minute and carries no billing risk.

If you want to swap in a different LLM later, `src/app/api/nlp/route.ts`
is the only file that needs to change — the response contract it returns
to the client stays the same.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in **Chrome or Edge** (Web Speech API support
varies — Safari and Firefox have limited/no support for `SpeechRecognition`).
Allow microphone access when prompted.

Try saying:
- "Add two apples"
- "I need milk" (this one is flagged out-of-stock in the demo catalog, so
  you'll hear it swap in almond milk automatically — that's the substitute
  feature)
- "Remove bread"
- "Find snacks under $3"
- "Clear my list"
- Switch the language pill to हिंदी or Español and try "दूध जोड़ो" or "necesito pan"

## Deployment (free tier)

This app has **no server-side code or secrets**, so hosting is a one-step
static/SSR deploy:

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), "Add New Project", import the repo.
3. Leave all settings default (Next.js is auto-detected) and click Deploy.
4. Done — no environment variables needed.

(Netlify or Firebase Hosting work the same way with their Next.js presets.)

## Approach (200 words)

I built a voice shopping assistant with a reliable offline core and an
optional AI layer on top, rather than depending entirely on a hosted LLM.
The default path is a compact rule-based NLP engine matching transcripts
against per-language keyword and alias dictionaries — instant, free, and
immune to network or rate-limit failures. Users who want richer phrase
understanding can paste their own free Gemini API key in Settings; each
command is then sent to a server route that calls Gemini first and
silently falls back to the offline parser on any error, timeout, or missing
key, so the feature only ever adds capability and never introduces a
failure mode.

Multilingual support works the same way at both layers: English, Hindi,
and Spanish each have their own intent-keyword and product-alias lists (or,
in AI mode, Gemini is instructed to detect and respond in the transcript's
language), and the Web Speech API is pointed at the selected language for
recognition and speech synthesis. Smart suggestions come from three simple,
explainable sources: a purchase-history counter (restock reminders), a
calendar lookup (seasonal picks), and a static substitute mapping used when
an item is marked out of stock.

The UI is a single-column, voice-first layout: a persistent mic button, a
live transcript/feedback bubble, and a categorized list. State persists to
`localStorage`, so it survives a refresh without any backend.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Web Speech API
· `localStorage` for persistence · zero external services
