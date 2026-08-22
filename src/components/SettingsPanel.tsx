"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Check, Trash2, X, ShieldCheck, ExternalLink } from "lucide-react";

const STORAGE_KEY = "voice_list_gemini_key";

export function useGeminiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiKeyState(saved);
    }
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

  useEffect(() => {
    setDraft(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onSave(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg apple-card p-6 sm:p-7 relative border border-white/10 shadow-2xl bg-[#121915]/95">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">AI Voice Engine</h3>
              <p className="text-xs text-white/50">Gemini-powered natural language processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-white/70 mb-5 leading-relaxed">
          Your voice assistant comes configured with Google Gemini for rich conversational understanding. If missing or rate-limited, it silently falls back to the ultra-fast offline parser.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste API Key (e.g. AIzaSy... or AQ....)"
                className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
              />
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
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
                  className="px-3 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-colors"
                  title="Clear key and use offline parser only"
                  aria-label="Clear API key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-white/40 border-t border-white/[0.06]">
            <span className="flex items-center gap-1.5 text-emerald-400/80">
              <ShieldCheck className="w-3.5 h-3.5" /> Stored locally in browser
            </span>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              Get Free Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
