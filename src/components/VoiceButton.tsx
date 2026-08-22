"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Sparkles, Volume2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { parseTranscript } from "@/lib/nlp";
import { LangCode, ParsedCommand, PriceFilter, Product } from "@/types";
import { findProductById } from "@/data/catalog";
import { SpeechRecognitionLike } from "@/types/speech";

const LANGUAGES: { code: LangCode; label: string; short: string }[] = [
  { code: "en-US", label: "English", short: "EN" },
  { code: "hi-IN", label: "हिंदी", short: "HI" },
  { code: "es-ES", label: "Español", short: "ES" },
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
    setFeedback("Thinking…");
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
        message = "Cleared your entire grocery list.";
        break;
      }
      case "REMOVE": {
        const targetName = parsed.matchedProduct?.name ?? parsed.customName;
        const removed = targetName ? removeByName(targetName) : false;
        message = removed ? `Removed ${targetName} from your list.` : `Couldn't find "${targetName}" on your list.`;
        break;
      }
      case "SEARCH": {
        const q = parsed.matchedProduct?.name ?? parsed.query ?? "";
        onSearchResults(q, parsed.priceFilter);
        message = parsed.priceFilter ? `Found grocery items in that price range.` : `Found results for "${q}".`;
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
              message = `${product.name} is out of stock — added ${sub.name} instead.`;
              break;
            }
          }
          addProduct(product, parsed.quantity, "voice");
          message = `Added ${parsed.quantity} ${product.name}.`;
        } else if (parsed.customName) {
          addCustomItem(parsed.customName, parsed.quantity, "Miscellaneous", "voice");
          message = `Added "${parsed.customName}" to Miscellaneous.`;
        } else {
          message = "Didn't catch an item name — please try again.";
        }
      }
    }

    setFeedback(message);
    speak(message);
    setIsProcessing(false);
    setTimeout(() => {
      setFeedback("");
      setTranscript("");
    }, 4500);
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 apple-card px-5 py-3 text-xs sm:text-sm text-rose-400 bg-black/90 border border-rose-500/20 shadow-2xl z-50">
        Voice recognition is supported in Chrome, Edge, and modern browsers.
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-40 px-4 w-full max-w-md pointer-events-none">
      {/* Live Voice Feedback Pill / Dynamic Island Expansion */}
      <div
        className={`transition-all duration-300 w-full pointer-events-auto ${
          feedback || transcript || listening || isProcessing
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="dynamic-island-container px-5 py-3.5 text-center text-white border border-emerald-500/30 shadow-2xl flex items-center justify-center gap-3">
          {listening && !transcript && (
            <div className="flex items-center gap-3">
              {/* Apple Audio Waveform */}
              <div className="flex items-center gap-1 h-5">
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-1" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-2" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-3" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-4" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Listening…
              </span>
            </div>
          )}

          {transcript && !isProcessing && (
            <span className="text-xs sm:text-sm font-medium text-white/90 truncate max-w-xs">
              &ldquo;{transcript}&rdquo;
            </span>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing voice command…</span>
            </div>
          )}

          {!isProcessing && !transcript && feedback && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-white/95">
                {feedback}
              </span>
              {usedAi && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase font-mono">
                  AI
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Apple Mic Bar */}
      <div className="dynamic-island-container p-2 flex items-center gap-2 pointer-events-auto border border-white/10 shadow-2xl">
        {/* Language Switcher Capsule */}
        <div className="flex bg-black/40 rounded-full p-1 border border-white/[0.06]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                lang === l.code
                  ? "bg-white text-black shadow-md shadow-white/10 font-bold"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {l.short}
            </button>
          ))}
        </div>

        {/* AI status badge */}
        {apiKey && (
          <span
            title="Gemini AI mode active with automatic offline fallback"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold"
          >
            <Sparkles className="w-3 h-3" /> AI
          </span>
        )}

        {/* Glowing Apple Mic Trigger Button */}
        <div className="relative">
          {listening && (
            <span
              className="absolute inset-[-4px] rounded-full bg-emerald-500/30 apple-mic-active"
              aria-hidden
            />
          )}
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            aria-label={listening ? "Stop listening" : "Start voice command"}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
              listening
                ? "bg-rose-500 hover:bg-rose-400 text-white scale-105"
                : "bg-emerald-500 hover:bg-emerald-400 text-black hover:scale-105 active:scale-95 shadow-emerald-500/25"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {listening ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Mic className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
