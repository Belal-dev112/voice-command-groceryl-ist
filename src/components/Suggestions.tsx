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
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h4 className="font-editorial text-base italic text-[#dedbd2] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#dedbd2]" /> Seasonal & Smart Picks
        </h4>
        <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
          Fresh in store
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((s, i) => {
          const isSeasonal = s.kind === "seasonal";
          const isSubstitute = s.kind === "substitute";

          return (
            <div
              key={`${s.product.id}-${i}`}
              className="stone-pill p-3 flex items-center gap-2.5 relative group"
            >
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-xl shrink-0">
                {s.product.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#202922] truncate">
                    {s.product.name}
                  </span>
                  <span className="text-xs font-bold text-[#202922] font-mono ml-1">
                    Rs. {s.product.price}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#202922]/70 flex items-center gap-1 truncate">
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
                className="w-7 h-7 shrink-0 rounded-lg bg-[#2b3d32] hover:bg-[#3d5546] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label={`Add ${s.product.name}`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
