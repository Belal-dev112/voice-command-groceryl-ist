"use client";

import React from "react";
import { useStore } from "@/lib/store";
import {
  getSeasonalSuggestions,
  getRestockSuggestions,
  getSubstituteSuggestions,
} from "@/lib/suggestions";
import { Plus, Sparkles, RefreshCw, Calendar, ArrowLeftRight } from "lucide-react";

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
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Smart Grocery Picks
        </h3>
        <span className="text-[11px] text-white/40 font-medium">
          {suggestions.length} recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((s, i) => {
          const isSeasonal = s.kind === "seasonal";
          const isSubstitute = s.kind === "substitute";

          return (
            <div
              key={`${s.product.id}-${i}`}
              className="apple-card apple-card-hover p-3.5 flex items-center gap-3.5 relative overflow-hidden group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                {s.product.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-medium text-sm text-white truncate">
                    {s.product.name}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400/90 font-mono ml-auto">
                    ${s.product.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSeasonal
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : isSubstitute
                        ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    }`}
                  >
                    {isSeasonal ? (
                      <Calendar className="w-2.5 h-2.5" />
                    ) : isSubstitute ? (
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                    ) : (
                      <RefreshCw className="w-2.5 h-2.5" />
                    )}
                    {s.reason}
                  </span>
                </div>
              </div>

              <button
                onClick={() => addProduct(s.product, 1, "suggestion")}
                className="w-8 h-8 shrink-0 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-black text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/10 hover:border-transparent"
                aria-label={`Add ${s.product.name}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
