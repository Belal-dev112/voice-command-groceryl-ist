"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Check, Trash2, X } from "lucide-react";

const STORAGE_KEY = "voice_list_gemini_key";

export function useGeminiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    setApiKeyState(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const setApiKey = (key: string) => {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(key);
  };

  return { apiKey, setApiKey };
}

interface SettingsPanelProps {
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function SettingsPanel({ apiKey, onSave, onClose }: SettingsPanelProps) {
  const [draft, setDraft] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="chalk-card p-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[var(--color-amber)]" /> AI mode (optional)
        </h3>
        <button onClick={onClose} className="text-[var(--color-chalk-dim)] hover:text-[var(--color-chalk)]" aria-label="Close settings">
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-sm text-[var(--color-chalk-dim)] mb-4 leading-relaxed">
        Paste a free Gemini API key to route voice commands through Google&apos;s
        Gemini model for richer phrase understanding. Without a key, the app
        uses its built-in offline parser — fully functional, just less
        flexible with unusual phrasing. Get a free key at{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-sage)] underline"
        >
          aistudio.google.com/apikey
        </a>
        . Your key is stored only in this browser&apos;s local storage — never sent anywhere but Google.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="AIzaSy..."
          className="flex-1 px-4 py-2.5 bg-[var(--color-board)] border border-[var(--color-chalk-dim)]/30 rounded-lg text-sm outline-none focus:border-[var(--color-amber)]"
        />
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[var(--color-amber)] text-[var(--color-board)] font-semibold rounded-lg text-sm hover:opacity-90 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Saved" : "Save"}
        </button>
        {apiKey && (
          <button
            onClick={() => {
              setDraft("");
              onSave("");
            }}
            className="px-3 py-2.5 text-[var(--color-coral)] hover:bg-[var(--color-coral)]/10 rounded-lg"
            aria-label="Remove key and use offline mode"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
