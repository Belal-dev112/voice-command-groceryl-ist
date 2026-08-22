import { catalog } from "@/data/catalog";
import { IntentAction, LangCode, ParsedCommand, PriceFilter, Product } from "@/types";

/**
 * This is a rule-based (dictionary + regex) NLP engine rather than a call to
 * a hosted LLM. It runs entirely in the browser, works offline, costs
 * nothing, and never fails due to rate limits or network issues — trading a
 * little linguistic nuance for 100% reliability and zero setup. See README
 * for the reasoning.
 */

// ---- 1. Intent keywords, per language -------------------------------------

const CLEAR_WORDS: Record<LangCode, string[]> = {
  "en-US": ["clear my list", "clear the list", "empty my list", "empty the list", "start over", "clear cart"],
  "hi-IN": ["सूची खाली करो", "list khali karo", "list saaf karo"],
  "es-ES": ["vacía la lista", "borra la lista", "limpia la lista"],
};

const REMOVE_WORDS: Record<LangCode, string[]> = {
  "en-US": ["remove", "delete", "take off", "get rid of", "don't need"],
  "hi-IN": ["हटाओ", "hatao", "nikaalo", "निकालो"],
  "es-ES": ["quita", "elimina", "borra", "no necesito"],
};

const SEARCH_WORDS: Record<LangCode, string[]> = {
  "en-US": ["find", "search for", "search", "look for", "show me", "is there"],
  "hi-IN": ["ढूंढो", "dhoondo", "khojo", "खोजो"],
  "es-ES": ["busca", "encuentra", "muéstrame"],
};

const ADD_WORDS: Record<LangCode, string[]> = {
  "en-US": ["add", "buy", "i need", "i want", "get me", "get", "put", "grab"],
  "hi-IN": ["जोड़ो", "jodo", "चाहिए", "chahiye", "khareedo", "खरीदो"],
  "es-ES": ["añade", "agrega", "necesito", "quiero", "compra"],
};

// ---- 2. Quantity words, per language ---------------------------------------

const NUMBER_WORDS: Record<LangCode, Record<string, number>> = {
  "en-US": {
    one: 1, a: 1, an: 1, two: 2, to: 2, too: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  },
  "hi-IN": {
    ek: 1, do: 2, teen: 3, char: 4, paanch: 5, panch: 5,
  },
  "es-ES": {
    un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  },
};

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?]/g, "");
}

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractQuantity(text: string, lang: LangCode): number {
  const digitMatch = text.match(/\b(\d{1,2})\b/);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (n > 0 && n <= 50) return n;
  }
  const words = text.split(/\s+/);
  const dict = NUMBER_WORDS[lang];
  for (const w of words) {
    if (dict[w] !== undefined) return dict[w];
  }
  return 1;
}

function extractPriceFilter(text: string): PriceFilter | undefined {
  // "between $5 and $10"
  const between = text.match(/between\s*\$?(\d+(?:\.\d+)?)\s*(?:and|to)\s*\$?(\d+(?:\.\d+)?)/);
  if (between) return { min: parseFloat(between[1]), max: parseFloat(between[2]) };

  // "under $5" / "below 5 dollars" / "less than 5"
  const under = text.match(/(?:under|below|less than)\s*\$?(\d+(?:\.\d+)?)/);
  if (under) return { max: parseFloat(under[1]) };

  // "over $5" / "more than 5"
  const over = text.match(/(?:over|above|more than)\s*\$?(\d+(?:\.\d+)?)/);
  if (over) return { min: parseFloat(over[1]) };

  return undefined;
}

function detectIntent(text: string, lang: LangCode): IntentAction {
  const clearList = CLEAR_WORDS[lang] ?? CLEAR_WORDS["en-US"];
  if (clearList.some((w) => text.includes(w))) return "CLEAR";

  const removeList = REMOVE_WORDS[lang] ?? REMOVE_WORDS["en-US"];
  if (removeList.some((w) => text.includes(w))) return "REMOVE";

  const searchList = SEARCH_WORDS[lang] ?? SEARCH_WORDS["en-US"];
  if (searchList.some((w) => text.includes(w))) return "SEARCH";

  const addList = ADD_WORDS[lang] ?? ADD_WORDS["en-US"];
  if (addList.some((w) => text.includes(w))) return "ADD";

  // Default to ADD — most bare utterances ("milk", "two apples") imply adding.
  return "ADD";
}

/** Finds the catalog product whose alias best matches the transcript, preferring longer/more specific aliases. */
function matchProduct(text: string, lang: LangCode): Product | undefined {
  const candidates: { product: Product; aliasLen: number }[] = [];

  for (const product of catalog) {
    const aliasSets = [
      ...(product.aliases[lang] ?? []),
      ...(product.aliases["en-US"] ?? []), // English fallback so mixed-language speech still resolves
    ];
    for (const alias of aliasSets) {
      const a = stripAccents(alias.toLowerCase());
      if (stripAccents(text).includes(a)) {
        candidates.push({ product, aliasLen: a.length });
      }
    }
  }

  if (candidates.length === 0) return undefined;
  candidates.sort((a, b) => b.aliasLen - a.aliasLen);
  return candidates[0].product;
}

function stripKnownWords(text: string, lang: LangCode): string {
  const all = [
    ...ADD_WORDS[lang] ?? [], ...REMOVE_WORDS[lang] ?? [], ...SEARCH_WORDS[lang] ?? [],
    ...ADD_WORDS["en-US"], ...REMOVE_WORDS["en-US"], ...SEARCH_WORDS["en-US"],
  ];
  let result = text;
  for (const phrase of all) result = result.replace(phrase, " ");
  result = result.replace(/\b(to|the|my|list|from|for|please|some|a|an|of)\b/g, " ");
  return result.replace(/\s+/g, " ").trim();
}

export function parseTranscript(rawTranscript: string, lang: LangCode): ParsedCommand {
  const text = normalize(rawTranscript);
  const action = detectIntent(text, lang);
  const quantity = extractQuantity(text, lang);
  const priceFilter = extractPriceFilter(text);
  const matchedProduct = matchProduct(text, lang);

  let customName: string | undefined;
  let query: string | undefined;

  if (action === "SEARCH") {
    query = stripKnownWords(text, lang);
  } else if (!matchedProduct && (action === "ADD" || action === "REMOVE")) {
    const leftover = stripKnownWords(text, lang).replace(/\b\d+\b/g, "").trim();
    customName = leftover.length > 0 ? leftover : undefined;
  }

  return { action, matchedProduct, customName, quantity, query, priceFilter, rawTranscript };
}

/** The catalog summary sent to Gemini so it can match against real product ids instead of inventing its own. */
export function catalogSummaryForPrompt(): string {
  return catalog.map((p) => `${p.id}: "${p.name}" (${p.category}, $${p.price})`).join("\n");
}
