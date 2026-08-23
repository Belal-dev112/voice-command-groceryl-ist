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
import { catalog } from "@/data/catalog";
import {
  Settings,
  Plus,
  Trash2,
  Package,
  Sparkles,
  Leaf,
  Volume2,
  Store,
  Calendar,
  Search,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

type ActiveTab = "pantry" | "market" | "harvest";

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Home() {
  const { items, addProduct, addCustomItem, clearList } = useStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("pantry");
  const [marketCategory, setMarketCategory] = useState<string>("All");
  const [marketSearch, setMarketSearch] = useState<string>("");
  const [search, setSearch] = useState<{ query: string; priceFilter?: PriceFilter } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [quickInput, setQuickInput] = useState("");
  const [quickCategory, setQuickCategory] = useState<Category>("Miscellaneous");
  const { apiKey, setApiKey } = useGeminiKey();

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = MONTH_NAMES[currentMonth - 1];

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const pickedUpCount = items.filter((i) => i.checked).length;
  const totalItemsCount = items.length;
  const progressPercent = totalItemsCount > 0 ? Math.round((pickedUpCount / totalItemsCount) * 100) : 0;

  // Calculate estimated total price in Rs.
  const estimatedTotal = items.reduce((sum, i) => {
    if (i.productId) {
      const match = catalog.find((p) => p.id === i.productId);
      return sum + (match?.price || 0) * i.quantity;
    }
    return sum;
  }, 0);

  // Filter market items
  const filteredMarketItems = catalog.filter((p) => {
    const categoryMatches = marketCategory === "All" || p.category === marketCategory;
    const searchMatches = marketSearch
      ? p.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
        (p.aliases["en-US"] ?? []).some((a) => a.toLowerCase().includes(marketSearch.toLowerCase())) ||
        (p.aliases["hi-IN"] ?? []).some((a) => a.includes(marketSearch.toLowerCase()))
      : true;
    return categoryMatches && searchMatches;
  });

  // Seasonal Harvest items
  const seasonalHarvestItems = catalog.filter((p) => p.seasonalMonths?.includes(currentMonth));

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    addCustomItem(quickInput.trim(), 1, quickCategory, "manual");
    setQuickInput("");
  };

  return (
    <div className="min-h-screen bg-[#2b3d32] text-[#f2efe9] flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="border-b border-white/[0.14] px-6 lg:px-14 py-4 flex items-center justify-between sticky top-0 bg-[#2b3d32]/90 backdrop-blur-md z-30">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab("pantry")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center text-[#dedbd2] group-hover:border-white transition-colors">
            <Leaf className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <span className="font-editorial italic text-base tracking-wide text-white">Voice Grocery</span>
            <span className="text-[10px] block uppercase tracking-[0.2em] text-white/50 font-sans">Organic Market</span>
          </div>
        </div>

        {/* Center Interactive Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-4 p-1 bg-[#202e26]/80 rounded-full border border-white/15 shadow-inner text-xs font-semibold uppercase tracking-[0.14em]">
          {/* Market Tab */}
          <button
            onClick={() => setActiveTab("market")}
            className={`px-3.5 sm:px-5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "market"
                ? "bg-[#dedbd2] text-[#202922] font-bold shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Market</span>
            <span className="text-[10px] opacity-70 font-mono">({catalog.length})</span>
          </button>

          {/* Pantry Tab */}
          <button
            onClick={() => setActiveTab("pantry")}
            className={`px-3.5 sm:px-5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "pantry"
                ? "bg-[#dedbd2] text-[#202922] font-bold shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pantry</span>
            {totalItemsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#202922] text-[#dedbd2] text-[10px] font-mono">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Harvest Tab */}
          <button
            onClick={() => setActiveTab("harvest")}
            className={`px-3.5 sm:px-5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "harvest"
                ? "bg-[#dedbd2] text-[#202922] font-bold shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Harvest</span>
            <span className="text-[10px] opacity-70 font-mono">({seasonalHarvestItems.length})</span>
          </button>
        </nav>

        {/* Action Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="px-3.5 sm:px-4 py-1.5 rounded-full border border-white/30 text-xs font-semibold tracking-wider uppercase text-white hover:bg-white/10 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Settings className="w-3 h-3 text-[#dedbd2]" />
          <span className="hidden sm:inline">AI Setup</span>
        </button>
      </header>

      {/* Main 3-Column / Editorial Grid */}
      <main className="max-w-[1400px] w-full mx-auto px-5 lg:px-12 py-8 lg:py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pb-44">
        {/* Left Column: Editorial Headline & Context */}
        <div className="lg:col-span-4 flex flex-col justify-between lg:h-full lg:sticky lg:top-24 space-y-6">
          <div>
            {/* View Specific Subtitle */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#dedbd2] text-[11px] font-semibold tracking-wider uppercase mb-3">
              {activeTab === "pantry" ? (
                <>
                  <ShoppingBag className="w-3 h-3" /> In Your Basket
                </>
              ) : activeTab === "market" ? (
                <>
                  <Store className="w-3 h-3" /> Full Catalog & Store
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3" /> {currentMonthName} Harvest
                </>
              )}
            </div>

            {/* Dynamic Editorial Headline */}
            <h1 className="font-editorial text-5xl sm:text-6xl italic font-normal tracking-tight text-[#f2efe9] leading-[1.08] mb-3">
              {activeTab === "pantry" ? "Pantry" : activeTab === "market" ? "Market" : "Harvest"}
            </h1>

            <div className="w-24 h-[1px] bg-white/30 mb-5" />

            {/* Narrative Description */}
            <p className="text-xs sm:text-sm text-[#f2efe9]/75 font-normal leading-relaxed max-w-sm mb-6">
              {activeTab === "pantry" &&
                "Review your shopping list, track picked up items, add custom groceries to Miscellaneous, or speak commands in English, Hindi, and Spanish."}
              {activeTab === "market" &&
                "Explore all fresh produce, dairy, bakery, snacks, and essentials available in the grocery catalog with real-time Indian Rupee (Rs.) pricing."}
              {activeTab === "harvest" &&
                `Discover fresh organic produce picked at peak seasonal freshness for ${currentMonthName}. Add them directly to your weekly grocery basket.`}
            </p>

            {/* Live Basket Summary Pill */}
            <div className="p-4 rounded-2xl bg-[#202e26]/80 border border-white/15 mb-5 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded-lg">
                    {progressPercent}%
                  </span>
                  <span className="text-xs text-white/80 font-medium">
                    {pickedUpCount} of {totalItemsCount} items picked
                  </span>
                </div>
                {estimatedTotal > 0 && (
                  <span className="text-xs font-bold font-mono text-[#dedbd2]">
                    Est. Rs. {estimatedTotal}
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#dedbd2] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

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
            {/* Ambient Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d2b22]/90 via-transparent to-black/20" />

            {/* Floating Badge */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs text-[#dedbd2] font-medium flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#dedbd2]" />
                <span>
                  {activeTab === "pantry" ? "Voice Assistant Ready" : activeTab === "market" ? "Browse & Add Items" : "In-Season Harvest"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <span className="w-2 h-2 rounded-full bg-[#dedbd2] animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Content Panel */}
        <div className="lg:col-span-4 forest-panel p-5 sm:p-7 space-y-5">
          {/* TAB 1: PANTRY VIEW */}
          {activeTab === "pantry" && (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-2xl italic text-white">Your Pantry Basket</h3>
                  <span className="text-xs font-mono text-white/50">({totalItemsCount} items)</span>
                </div>
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

              {/* Seasonal & Smart Suggestions */}
              <Suggestions />

              {/* Categorized Shopping List */}
              <ShoppingList />
            </>
          )}

          {/* TAB 2: MARKET VIEW (All Items in the Store) */}
          {activeTab === "market" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-editorial text-2xl italic text-white">Marketplace Catalog</h3>
                  <p className="text-xs text-white/50">All {catalog.length} items available in store</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#202e26] border border-white/15 rounded-xl">
                <Search className="w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  placeholder="Search catalog by name or Hindi/Spanish..."
                  className="bg-transparent text-xs text-white placeholder:text-white/40 outline-none w-full"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {["All", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMarketCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs ${
                      marketCategory === cat
                        ? "bg-[#dedbd2] text-[#202922] font-bold"
                        : "bg-white/5 text-white/70 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredMarketItems.map((product) => {
                  const alreadyInCart = items.find((i) => i.productId === product.id);

                  return (
                    <div
                      key={product.id}
                      className="stone-pill p-3 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{product.emoji}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-[#202922] truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#202922] font-mono">
                              Rs. {product.price}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-[#202922]/60 font-medium">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => addProduct(product, 1, "manual")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                          alreadyInCart
                            ? "bg-[#2b3d32] text-white"
                            : "bg-[#202922] text-[#dedbd2] hover:bg-[#344a3c]"
                        }`}
                      >
                        {alreadyInCart ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Basket ({alreadyInCart.quantity})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HARVEST VIEW (Currently In-Season) */}
          {activeTab === "harvest" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-editorial text-2xl italic text-white">{currentMonthName} Harvest</h3>
                  <p className="text-xs text-white/50">Fresh produce harvested at peak season</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs text-[#dedbd2] font-semibold">
                  {seasonalHarvestItems.length} in season
                </span>
              </div>

              {/* Harvest In-Season Cards */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {seasonalHarvestItems.map((product) => {
                  const alreadyInCart = items.find((i) => i.productId === product.id);

                  return (
                    <div
                      key={product.id}
                      className="stone-pill p-3.5 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl shrink-0">{product.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-[#202922] truncate">
                              {product.name}
                            </p>
                            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#50775a] text-white">
                              Peak Fresh
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#202922] font-mono">
                              Rs. {product.price}
                            </span>
                            <span className="text-[10px] text-[#202922]/70">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => addProduct(product, 1, "suggestion")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                          alreadyInCart
                            ? "bg-[#2b3d32] text-white"
                            : "bg-[#50775a] text-white hover:bg-[#5d8b69]"
                        }`}
                      >
                        {alreadyInCart ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added ({alreadyInCart.quantity})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel apiKey={apiKey} onSave={setApiKey} onClose={() => setShowSettings(false)} />
      )}

      {/* Bottom Floating Dynamic Island Voice Control */}
      <VoiceButton
        apiKey={apiKey}
        onSearchResults={(query, priceFilter) => {
          setActiveTab("pantry");
          setSearch({ query, priceFilter });
        }}
      />
    </div>
  );
}
