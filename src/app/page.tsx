"use client";

import React, { useState } from "react";
import Image from "next/image";
import VoiceButton from "@/components/VoiceButton";
import ShoppingList from "@/components/ShoppingList";
import Suggestions from "@/components/Suggestions";
import SearchResults from "@/components/SearchResults";
import SettingsPanel, { useGeminiKey } from "@/components/SettingsPanel";
import { useStore } from "@/lib/store";
import { Category, PriceFilter } from "@/types";
import {
  Settings,
  Plus,
  Trash2,
  Package,
  Sparkles,
  Leaf,
  Volume2,
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
    <div className="min-h-screen bg-[#2b3d32] text-[#f2efe9] flex flex-col justify-between">
      {/* Top Header Navigation matching reference layout */}
      <header className="border-b border-white/[0.14] px-6 lg:px-14 py-4 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center text-[#dedbd2]">
            <Leaf className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <span className="font-editorial italic text-base tracking-wide text-white">Voice Grocery</span>
            <span className="text-[10px] block uppercase tracking-[0.2em] text-white/50 font-sans">Organic Pantry</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="hover:text-white cursor-pointer transition-colors">Market</span>
          <span className="hover:text-white cursor-pointer transition-colors">Pantry</span>
          <span className="hover:text-white cursor-pointer transition-colors">Harvest</span>
        </nav>

        {/* Action Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-1.5 rounded-full border border-white/30 text-xs font-semibold tracking-wider uppercase text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Settings className="w-3 h-3 text-[#dedbd2]" /> AI Setup
        </button>
      </header>

      {/* Main 3-Column / Editorial Grid matching reference image */}
      <main className="max-w-[1400px] w-full mx-auto px-5 lg:px-12 py-8 lg:py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pb-44">
        {/* Left Column: Editorial Headline & Narrative */}
        <div className="lg:col-span-4 flex flex-col justify-between lg:h-full lg:sticky lg:top-24 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#dedbd2] text-[11px] font-semibold tracking-wider uppercase mb-4">
              <Sparkles className="w-3 h-3" /> Voice-Powered Market
            </div>

            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl italic font-normal tracking-tight text-[#f2efe9] leading-[1.08] mb-4">
              Pantry
            </h1>

            <div className="w-24 h-[1px] bg-white/30 mb-6" />

            <p className="text-sm sm:text-base text-[#f2efe9]/75 font-normal leading-relaxed max-w-sm mb-6">
              Say it, don&apos;t type it. Speak naturally in English, Hindi, or Spanish to organize weekly groceries, discover seasonal produce, and manage your kitchen essentials.
            </p>

            {/* Live Progress Card */}
            {totalItemsCount > 0 && (
              <div className="p-4 rounded-2xl bg-[#202e26]/80 border border-white/15 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-lg">
                      {progressPercent}%
                    </span>
                    <span className="text-xs text-white/80 font-medium">
                      {pickedUpCount} of {totalItemsCount} picked up
                    </span>
                  </div>
                  <span className="text-xs font-mono text-white/50">{totalQuantity} units</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#dedbd2] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Custom Item Addition Box */}
            <form onSubmit={handleQuickAdd} className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-[#202e26]/90 border border-white/15 rounded-2xl focus-within:border-white/40 transition-colors">
                <Package className="w-4 h-4 text-[#dedbd2] ml-1 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Add custom item (e.g. Organic Honey)..."
                  className="bg-transparent text-xs sm:text-sm text-white placeholder:text-white/40 outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as Category)}
                  className="flex-1 px-3 py-2 bg-[#202e26] text-xs text-white/80 rounded-xl border border-white/15 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#202e26] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!quickInput.trim()}
                  className="px-4 py-2 moss-btn text-xs font-semibold disabled:opacity-40 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Center Column: Portrait Grocery Photo Showcase Card */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[380px] aspect-[9/15] rounded-[32px] overflow-hidden border border-white/15 shadow-2xl bg-[#1d2b22] group">
            <Image
              src="/grocery_hero.jpg"
              alt="Hand holding fresh organic grocery tote"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d2b22]/90 via-transparent to-black/20" />

            {/* Bottom Floating Badge matching reference layout */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs text-[#dedbd2] font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#dedbd2]" /> Voice Assistant Ready
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <span className="w-2 h-2 rounded-full bg-[#dedbd2] animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Grocery Manager Panel matching reference right card */}
        <div className="lg:col-span-4 forest-panel p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-editorial text-2xl italic text-white">Your Basket</h3>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all items from your grocery list?")) {
                    clearList();
                  }
                }}
                className="text-xs text-white/50 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Voice Search Results */}
          {search && (
            <SearchResults
              query={search.query}
              priceFilter={search.priceFilter}
              onClose={() => setSearch(null)}
            />
          )}

          {/* Smart & Seasonal Recommendations */}
          <Suggestions />

          {/* Categorized Shopping List */}
          <ShoppingList />
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel apiKey={apiKey} onSave={setApiKey} onClose={() => setShowSettings(false)} />
      )}

      {/* Bottom Floating Dynamic Island Voice Control */}
      <VoiceButton
        apiKey={apiKey}
        onSearchResults={(query, priceFilter) => setSearch({ query, priceFilter })}
      />
    </div>
  );
}
