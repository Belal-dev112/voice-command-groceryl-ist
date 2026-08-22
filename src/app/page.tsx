"use client";

import React, { useState } from "react";
import VoiceButton from "@/components/VoiceButton";
import ShoppingList from "@/components/ShoppingList";
import Suggestions from "@/components/Suggestions";
import SearchResults from "@/components/SearchResults";
import SettingsPanel, { useGeminiKey } from "@/components/SettingsPanel";
import { useStore } from "@/lib/store";
import { PriceFilter } from "@/types";
import { ShoppingBasket, Settings } from "lucide-react";

export default function Home() {
  const { items } = useStore();
  const [search, setSearch] = useState<{ query: string; priceFilter?: PriceFilter } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { apiKey, setApiKey } = useGeminiKey();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const pickedUp = items.filter((i) => i.checked).length;

  return (
    <main className="min-h-screen pb-56 max-w-2xl mx-auto px-5">
      <header className="pt-10 pb-8 text-center relative">
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="absolute right-0 top-10 chalk-card p-2.5 text-[var(--color-chalk-dim)] hover:text-[var(--color-amber)]"
          aria-label="Open AI settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-2 chalk-card px-4 py-1.5 mb-4">
          <ShoppingBasket className="w-4 h-4 text-[var(--color-amber)]" />
          <span className="text-xs uppercase tracking-[0.15em] text-[var(--color-chalk-dim)]">Voice List</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mb-2">Say it, don&apos;t type it.</h1>
        <p className="text-[var(--color-chalk-dim)] text-sm">
          {totalItems > 0 ? `${totalItems} items · ${pickedUp} picked up` : "Your voice-controlled shopping list"}
        </p>
      </header>

      {showSettings && (
        <SettingsPanel apiKey={apiKey} onSave={setApiKey} onClose={() => setShowSettings(false)} />
      )}

      {search && (
        <SearchResults query={search.query} priceFilter={search.priceFilter} onClose={() => setSearch(null)} />
      )}

      <Suggestions />

      <ShoppingList />

      <VoiceButton apiKey={apiKey} onSearchResults={(query, priceFilter) => setSearch({ query, priceFilter })} />
    </main>
  );
}
