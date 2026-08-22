"use client";

import React from "react";
import { catalog } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { PriceFilter } from "@/types";
import { Plus, X, SearchX, ShoppingBag } from "lucide-react";

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
        (p.aliases["en-US"] ?? []).some((a) => a.includes(query.toLowerCase())) ||
        (p.aliases["hi-IN"] ?? []).some((a) => a.includes(query.toLowerCase())) ||
        (p.aliases["es-ES"] ?? []).some((a) => a.includes(query.toLowerCase()))
      : true;
    const priceOk =
      (priceFilter?.min === undefined || p.price >= priceFilter.min) &&
      (priceFilter?.max === undefined || p.price <= priceFilter.max);
    return nameMatches && priceOk;
  });

  return (
    <section className="mb-8 apple-card p-5 border border-emerald-500/20 bg-[#121915]/90 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-display font-semibold text-base text-white">
            Search Results {query ? <span className="text-emerald-400">&ldquo;{query}&rdquo;</span> : ""}
            {priceFilter?.max ? (
              <span className="text-xs text-white/50 ml-1.5 font-mono">(Under Rs. {priceFilter.max})</span>
            ) : null}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label="Close search results"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center text-white/50">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-white/40">
            <SearchX className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-white/70">No matching items in catalog</p>
          <p className="text-xs text-white/40 mt-1 max-w-xs">
            Say &ldquo;Add {query || "item"}&rdquo; or type it above to add it directly to Miscellaneous.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {results.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-2xl p-3.5 transition-all"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-emerald-400 font-mono">
                    Rs. {p.price}
                  </span>
                  <span className="text-[10px] text-white/40 px-2 py-0.5 rounded-full bg-white/5">
                    {p.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => addProduct(p, 1, "voice")}
                className="w-8 h-8 shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
                aria-label={`Add ${p.name}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
