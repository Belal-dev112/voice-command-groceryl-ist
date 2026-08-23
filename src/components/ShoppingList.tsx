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
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-7 h-7 border-2 border-white/20 border-t-[#50775a] rounded-full animate-spin" />
        <span className="text-xs text-white/50 font-medium">Loading pantry basket…</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center flex flex-col items-center border border-dashed border-white/15 rounded-2xl bg-white/[0.02]">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#dedbd2] mb-3">
          <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="font-editorial text-xl italic text-white mb-1">
          Your basket is empty
        </h4>
        <p className="text-xs text-white/60 max-w-xs mb-4 leading-relaxed">
          Say an item like &ldquo;Add whole milk&rdquo; or type below to populate your grocery list.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {['"Add 2 apples"', '"I need milk"', '"Snacks under Rs. 50"'].map((phrase, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-[11px] text-white/70 bg-black/20 rounded-full border border-white/10 flex items-center gap-1"
            >
              <Mic className="w-2.5 h-2.5 text-[#dedbd2]" /> {phrase}
            </span>
          ))}
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
    <div className="space-y-5">
      {Object.entries(grouped).map(([categoryName, categoryItems]) => {
        const category = categoryName as Category;
        const icon = CATEGORY_ICONS[category] || "🛒";
        const completedInCategory = categoryItems.filter((i) => i.checked).length;

        return (
          <section key={category} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <h4 className="font-medium text-xs sm:text-sm tracking-wide text-white/90 uppercase font-sans">
                  {category}
                </h4>
              </div>
              <span className="text-[11px] text-white/50 font-mono">
                {completedInCategory}/{categoryItems.length}
              </span>
            </div>

            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`stone-pill p-3 sm:p-3.5 flex items-center gap-3 transition-all ${
                    item.checked ? "opacity-45 scale-[0.99]" : ""
                  }`}
                >
                  {/* Circular Check Indicator matching reference radio/circle look */}
                  <button
                    onClick={() => toggleChecked(item.id)}
                    aria-label={item.checked ? "Mark as needed" : "Mark as picked up"}
                    className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
                      item.checked
                        ? "bg-[#2b3d32] border-[#2b3d32] text-white"
                        : "border-[#202922]/50 hover:border-[#202922] bg-transparent"
                    }`}
                  >
                    {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  {/* Emoji Badge */}
                  <span className="text-lg shrink-0">{getItemEmoji(item)}</span>

                  {/* Item Name & Meta */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm text-[#202922] truncate ${
                        item.checked ? "line-through text-[#202922]/60" : ""
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] tracking-wider uppercase text-[#202922]/60 font-medium flex items-center gap-0.5">
                        {item.addedVia === "voice" ? (
                          <>
                            <Mic className="w-2.5 h-2.5 text-[#2b3d32]" /> Voice
                          </>
                        ) : item.addedVia === "suggestion" ? (
                          <>
                            <Sparkles className="w-2.5 h-2.5 text-[#50775a]" /> Pick
                          </>
                        ) : (
                          <>
                            <PenLine className="w-2.5 h-2.5 text-[#2b3d32]" /> Manual
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-[#202922]/10 rounded-xl p-0.5 gap-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#202922]/70 hover:text-red-700 hover:bg-black/5 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#202922] font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#202922]/70 hover:text-[#2b3d32] hover:bg-black/5 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeById(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#202922]/40 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
