"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Plus, Minus, Trash2, Check, ShoppingBag, Mic, Sparkles, PenLine } from "lucide-react";
import { Category } from "@/types";
import { catalog } from "@/data/catalog";

const CATEGORY_ICONS: Record<Category, string> = {
  Produce: "🥦",
  "Dairy & Eggs": "🧀",
  "Meat & Seafood": "🐟",
  Bakery: "🥖",
  Pantry: "🌾",
  Frozen: "🧊",
  Beverages: "🧃",
  Snacks: "🥨",
  Household: "🧼",
  Miscellaneous: "📦",
};

export default function ShoppingList() {
  const { items, loading, updateQuantity, toggleChecked, removeById } = useStore();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-xs text-white/40 font-medium">Loading your grocery basket…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="apple-card p-8 sm:p-12 text-center flex flex-col items-center my-6 border-dashed border-white/15 bg-white/[0.02]">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
          Your Grocery Basket is Empty
        </h3>
        <p className="text-xs sm:text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
          Tap the floating mic below or type an item to add fresh groceries, snacks, or custom items to Miscellaneous.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
          {['"Add 2 apples"', '"I need whole milk"', '"Add paper towels"', '"Find snacks under $3"'].map(
            (phrase, idx) => (
              <span
                key={idx}
                className="apple-pill px-3 py-1 text-xs text-white/60 font-mono flex items-center gap-1.5"
              >
                <Mic className="w-3 h-3 text-emerald-400" /> {phrase}
              </span>
            )
          )}
        </div>
      </div>
    );
  }

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  const getItemEmoji = (item: (typeof items)[0]) => {
    if (item.productId) {
      const match = catalog.find((p) => p.id === item.productId);
      if (match?.emoji) return match.emoji;
    }
    return CATEGORY_ICONS[item.category] || "🛒";
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([categoryName, categoryItems]) => {
        const category = categoryName as Category;
        const icon = CATEGORY_ICONS[category] || "🛒";
        const completedInCategory = categoryItems.filter((i) => i.checked).length;

        return (
          <section key={category} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="font-display font-semibold text-sm sm:text-base text-white">
                  {category}
                </h3>
              </div>
              <span className="text-xs text-white/40 font-medium font-mono">
                {completedInCategory}/{categoryItems.length}
              </span>
            </div>

            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`apple-card apple-card-hover px-4 py-3.5 flex items-center gap-3.5 transition-all duration-200 ${
                    item.checked
                      ? "opacity-50 bg-white/[0.02] border-white/[0.04]"
                      : "bg-[#141d18]/80 border-white/[0.08]"
                  }`}
                >
                  {/* Apple iOS Circular Checkbox */}
                  <button
                    onClick={() => toggleChecked(item.id)}
                    aria-label={item.checked ? "Mark as needed" : "Mark as picked up"}
                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 border ${
                      item.checked
                        ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30 scale-95"
                        : "border-white/25 hover:border-emerald-400 bg-black/20"
                    }`}
                  >
                    {item.checked && (
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    )}
                  </button>

                  {/* Emoji Badge */}
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-lg shrink-0">
                    {getItemEmoji(item)}
                  </div>

                  {/* Item Name and Meta */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm text-white truncate transition-all ${
                        item.checked ? "line-through text-white/40" : ""
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1 font-medium">
                        {item.addedVia === "voice" ? (
                          <>
                            <Mic className="w-2.5 h-2.5 text-emerald-400" /> Voice
                          </>
                        ) : item.addedVia === "suggestion" ? (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Smart Pick
                          </>
                        ) : (
                          <>
                            <PenLine className="w-2.5 h-2.5 text-sky-400" /> Manual
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Apple iOS Tactile Capsule Stepper */}
                  <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-2xl p-1 gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white/60 hover:text-rose-400 hover:bg-white/10 active:scale-90 transition-all"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white/60 hover:text-emerald-400 hover:bg-white/10 active:scale-90 transition-all"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeById(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
