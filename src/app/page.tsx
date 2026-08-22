"use client";

import React, { useState } from "react";
import VoiceButton from "@/components/VoiceButton";
import ShoppingList from "@/components/ShoppingList";
import Suggestions from "@/components/Suggestions";
import SearchResults from "@/components/SearchResults";
import SettingsPanel, { useGeminiKey } from "@/components/SettingsPanel";
import { useStore } from "@/lib/store";
import { Category, PriceFilter } from "@/types";
import {
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Package,
} from "lucide-react";

const CATEGORIES: Category[] = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Household",
  "Miscellaneous",
];

export default function Home() {
  const { items, addCustomItem, clearList } = useStore();
  const [search, setSearch] = useState<{ query: string; priceFilter?: PriceFilter } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [quickInput, setQuickInput] = useState("");
  const [quickCategory, setQuickCategory] = useState<Category>("Miscellaneous");
  const { apiKey, setApiKey } = useGeminiKey();

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const pickedUpCount = items.filter((i) => i.checked).length;
  const totalItemsCount = items.length;
  const progressPercent = totalItemsCount > 0 ? Math.round((pickedUpCount / totalItemsCount) * 100) : 0;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    addCustomItem(quickInput.trim(), 1, quickCategory, "manual");
    setQuickInput("");
  };

  return (
    <main className="min-h-screen pb-44 max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Voice Grocery</span>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all shadow-sm active:scale-95"
          aria-label="Open AI settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Title & Subtitle */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Say it, don&apos;t type it.
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Your minimalist voice assistant for fresh groceries and shopping lists.
        </p>
      </div>

      {/* Apple Summary Card / Basket Progress */}
      {items.length > 0 && (
        <div className="apple-card p-4 sm:p-5 mb-6 border border-white/[0.08] bg-[#121915]/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono border border-emerald-500/20">
                {progressPercent}%
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {pickedUpCount} of {totalItemsCount} items picked up
                </p>
                <p className="text-[11px] text-white/40 font-medium font-mono">
                  {totalQuantity} total units in basket
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Clear all items from your grocery list?")) {
                  clearList();
                }
              }}
              className="text-xs text-white/40 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.04]">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Add / Miscellaneous Item Input */}
      <form onSubmit={handleQuickAdd} className="apple-card p-2 sm:p-2.5 mb-6 flex flex-col sm:flex-row gap-2 border border-white/[0.08]">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-black/30 rounded-2xl border border-white/[0.06] focus-within:border-emerald-500/50">
          <Package className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Add custom item (e.g. organic honey, olive oil)..."
            className="bg-transparent text-xs sm:text-sm text-white placeholder:text-white/30 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value as Category)}
            className="px-3 py-2.5 bg-black/30 text-xs text-white/80 rounded-2xl border border-white/[0.06] outline-none hover:border-white/20 transition-all font-medium cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#121915] text-white">
                {cat}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-black font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel apiKey={apiKey} onSave={setApiKey} onClose={() => setShowSettings(false)} />
      )}

      {/* Voice / Search Results */}
      {search && (
        <SearchResults
          query={search.query}
          priceFilter={search.priceFilter}
          onClose={() => setSearch(null)}
        />
      )}

      {/* Smart Grocery Suggestions */}
      <Suggestions />

      {/* Categorized Shopping List */}
      <ShoppingList />

      {/* Apple Dynamic Island Floating Voice Control */}
      <VoiceButton
        apiKey={apiKey}
        onSearchResults={(query, priceFilter) => setSearch({ query, priceFilter })}
      />
    </main>
  );
}
