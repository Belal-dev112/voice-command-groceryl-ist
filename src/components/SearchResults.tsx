"use client";

import React from "react";
import { catalog } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { PriceFilter } from "@/types";
import { Plus, X, SearchX } from "lucide-react";

interface SearchResultsProps {
  query: string;
  priceFilter?: PriceFilter;
  onClose: () => void;
}

export default function SearchResults({ query, priceFilter, onClose }: SearchResultsProps) {
  const { addProduct } = useStore();

  const results = catalog.filter((p) => {
    const nameMatches = query
      ? p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.aliases["en-US"] ?? []).some((a) => a.includes(query.toLowerCase()))
      : true;
    const priceOk =
      (priceFilter?.min === undefined || p.price >= priceFilter.min) &&
      (priceFilter?.max === undefined || p.price <= priceFilter.max);
    return nameMatches && priceOk;
  });

  return (
    <section className="mb-8 chalk-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-[var(--color-amber)]">
          Search results{query ? ` for "${query}"` : ""}
        </h3>
        <button onClick={onClose} className="text-[var(--color-chalk-dim)] hover:text-[var(--color-chalk)]" aria-label="Close search results">
          <X className="w-5 h-5" />
        </button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center text-[var(--color-chalk-dim)]">
          <SearchX className="w-8 h-8 mb-2" />
          <p className="text-sm">No matches — try a different item or price range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {results.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-[var(--color-board)] rounded-xl px-4 py-3">
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-[var(--color-sage)] font-semibold">${p.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => addProduct(p, 1, "voice")}
                className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-amber)] text-[var(--color-board)] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={`Add ${p.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
