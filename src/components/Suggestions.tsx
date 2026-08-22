"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { getSeasonalSuggestions, getRestockSuggestions, getSubstituteSuggestions } from "@/lib/suggestions";
import { Plus, Sparkles } from "lucide-react";

export default function Suggestions() {
  const { items, purchaseHistory, addProduct } = useStore();

  const suggestions = [
    ...getSubstituteSuggestions(items),
    ...getRestockSuggestions(purchaseHistory, items),
    ...getSeasonalSuggestions(items),
  ].slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="font-display text-lg text-[var(--color-amber)] mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> You might also need
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((s, i) => (
          <div key={`${s.product.id}-${i}`} className="chalk-card flex items-center gap-3 px-4 py-3">
            <span className="text-2xl">{s.product.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{s.product.name}</p>
              <p className="text-xs text-[var(--color-chalk-dim)] truncate">{s.reason}</p>
            </div>
            <button
              onClick={() => addProduct(s.product, 1, "suggestion")}
              className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-amber)] text-[var(--color-board)] flex items-center justify-center hover:scale-105 transition-transform"
              aria-label={`Add ${s.product.name}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
