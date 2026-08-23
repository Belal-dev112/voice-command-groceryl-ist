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
    <section className="mb-6 forest-panel p-5 border border-white/15 bg-[#1d2b22]/95 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[#dedbd2]">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-editorial text-lg italic text-white">
            Search Results {query ? <span className="text-[#dedbd2]">&ldquo;{query}&rdquo;</span> : ""}
            {priceFilter?.max ? (
              <span className="text-xs text-white/50 ml-1.5 font-mono font-normal not-italic">(Under Rs. {priceFilter.max})</span>
            ) : null}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label="Close search results"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center text-white/50">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2.5 text-white/40">
            <SearchX className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-white/70">No matching items found</p>
          <p className="text-[11px] text-white/40 mt-1 max-w-xs">
            Say &ldquo;Add {query || "item"}&rdquo; or type it above to add to Miscellaneous.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {results.map((p) => (
            <div
              key={p.id}
              className="stone-pill p-3 flex items-center gap-2.5 transition-all"
            >
              <span className="text-xl shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[#202922] truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-[#202922] font-mono">
                    Rs. {p.price}
                  </span>
                  <span className="text-[9px] text-[#202922]/60 px-1.5 py-0.5 rounded bg-black/5">
                    {p.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => addProduct(p, 1, "voice")}
                className="w-7 h-7 shrink-0 rounded-lg bg-[#2b3d32] hover:bg-[#3d5546] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label={`Add ${p.name}`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
