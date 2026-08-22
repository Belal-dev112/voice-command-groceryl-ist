"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { parseTranscript } from "@/lib/nlp";
import { LangCode, ParsedCommand, PriceFilter, Product } from "@/types";
import { findProductById } from "@/data/catalog";
import { SpeechRecognitionLike } from "@/types/speech";

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "es-ES", label: "Español" },
];

const AI_TIMEOUT_MS = 6000;

interface VoiceButtonProps {
  apiKey: string;
  onSearchResults: (query: string, priceFilter?: PriceFilter) => void;
}

/** Calls the optional Gemini-backed API route; returns null on any failure so the caller can fall back. */
async function tryAiParse(
  transcript: string,
  apiKey: string,
  currentItems: { name: string; quantity: number }[]
): Promise<Omit<ParsedCommand, "rawTranscript"> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const res = await fetch("/api/nlp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, apiKey, currentItems }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.error || !data.action || data.action === "UNKNOWN") return null;

    return {
      action: data.action,
      matchedProduct: data.matchedProductId ? findProductById(data.matchedProductId) : undefined,
      customName: data.customName ?? undefined,
      quantity: data.quantity && data.quantity > 0 ? data.quantity : 1,
      query: data.query ?? undefined,
      priceFilter:
        data.priceMin != null || data.priceMax != null
          ? { min: data.priceMin ?? undefined, max: data.priceMax ?? undefined }
          : undefined,
    };
  } catch {
    return null; // network error, timeout, bad JSON — caller falls back to offline parser
  } finally {
    clearTimeout(timeout);
  }
}

export default function VoiceButton({ apiKey, onSearchResults }: VoiceButtonProps) {
  const { items, addProduct, addCustomItem, removeByName, clearList } = useStore();
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [usedAi, setUsedAi] = useState(false);
  const [lang, setLang] = useState<LangCode>("en-US");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setFeedback("Didn't catch that — try again.");
      setTimeout(() => setFeedback(""), 3000);
    };
    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, apiKey]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = async (text: string) => {
    setIsProcessing(true);
    setFeedback("Thinking...");
    setUsedAi(false);

    let parsed: Omit<ParsedCommand, "rawTranscript"> | null = null;

    if (apiKey) {
      const currentItems = itemsRef.current.map((i) => ({ name: i.name, quantity: i.quantity }));
      parsed = await tryAiParse(text, apiKey, currentItems);
      if (parsed) setUsedAi(true);
    }

    if (!parsed) {
      parsed = parseTranscript(text, lang); // offline fallback — always available, never fails
    }

    let message = "";

    switch (parsed.action) {
      case "CLEAR": {
        clearList();
        message = "Cleared your whole list.";
        break;
      }
      case "REMOVE": {
        const targetName = parsed.matchedProduct?.name ?? parsed.customName;
        const removed = targetName ? removeByName(targetName) : false;
        message = removed ? `Removed ${targetName} from your list.` : "I couldn't find that on your list.";
        break;
      }
      case "SEARCH": {
        const q = parsed.matchedProduct?.name ?? parsed.query ?? "";
        onSearchResults(q, parsed.priceFilter);
        message = parsed.priceFilter ? `Here's what I found in that price range.` : `Here's what I found for "${q}".`;
        break;
      }
      case "ADD":
      default: {
        if (parsed.matchedProduct) {
          const product: Product = parsed.matchedProduct;
          if (product.outOfStock && product.substituteId) {
            const sub = findProductById(product.substituteId);
            if (sub) {
              addProduct(sub, parsed.quantity, "voice");
              message = `${product.name} is out of stock — I added ${sub.name} instead.`;
              break;
            }
          }
          addProduct(product, parsed.quantity, "voice");
          message = `Added ${parsed.quantity} ${product.name} to your list.`;
        } else if (parsed.customName) {
          addCustomItem(parsed.customName, parsed.quantity);
          message = `Added "${parsed.customName}" to your list.`;
        } else {
          message = "I didn't catch an item name — try again.";
        }
      }
    }

    setFeedback(message);
    speak(message);
    setIsProcessing(false);
    setTimeout(() => {
      setFeedback("");
      setTranscript("");
    }, 4000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel();
      setTranscript("");
      setFeedback("");
      try {
        recognitionRef.current.start();
      } catch {
        // start() throws if already started — safe to ignore.
      }
    }
  };

  if (!supported) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 chalk-card px-5 py-3 text-sm text-[var(--color-coral)]">
        Voice input isn&apos;t supported in this browser. Try Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40 px-4">
      {/* Language picker */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 chalk-card px-2 py-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                lang === l.code
                  ? "bg-[var(--color-amber)] text-[var(--color-board)]"
                  : "text-[var(--color-chalk-dim)] hover:text-[var(--color-chalk)]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {apiKey && (
          <span
            title="Gemini AI mode is on — offline parser is the automatic fallback"
            className="flex items-center gap-1 chalk-card px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-sage)]"
          >
            <Sparkles className="w-3 h-3" /> AI on
          </span>
        )}
      </div>

      {/* Feedback bubble */}
      <div
        className={`transition-all duration-300 ${
          feedback || transcript || listening ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="chalk-card px-6 py-3 max-w-xs sm:max-w-sm text-center font-display text-lg leading-snug">
          {listening && !transcript && <span className="text-[var(--color-sage)]">Listening…</span>}
          {transcript && !isProcessing && <span>&ldquo;{transcript}&rdquo;</span>}
          {isProcessing && (
            <span className="flex items-center justify-center gap-2 text-[var(--color-amber)]">
              <Loader2 className="w-5 h-5 animate-spin" /> Thinking…
            </span>
          )}
          {!isProcessing && !transcript && feedback && (
            <span>
              {feedback}
              {usedAi && <span className="block text-[10px] text-[var(--color-sage)] mt-1 uppercase tracking-wide">via Gemini</span>}
            </span>
          )}
        </div>
      </div>

      {/* Mic button with hand-sketched chalk ring */}
      <div className="relative">
        {listening && (
          <span
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-[var(--color-sage)] chalk-ring"
            aria-hidden
          />
        )}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          aria-label={listening ? "Stop listening" : "Start voice command"}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            listening
              ? "bg-[var(--color-sage)] border-[var(--color-chalk)] scale-105"
              : "bg-[var(--color-board-light)] border-dashed border-[var(--color-chalk-dim)] hover:border-[var(--color-amber)]"
          } ${isProcessing ? "opacity-60" : ""}`}
        >
          {listening ? (
            <Square className="w-7 h-7 text-[var(--color-board)] fill-current" />
          ) : (
            <Mic className="w-8 h-8 text-[var(--color-chalk)]" />
          )}
        </button>
      </div>
    </div>
  );
}
