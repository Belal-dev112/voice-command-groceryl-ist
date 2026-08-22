"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Plus, Minus, Trash2, ShoppingBasket, Check } from "lucide-react";
import { Category } from "@/types";

export default function ShoppingList() {
  const { items, loading, updateQuantity, toggleChecked, removeById } = useStore();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--color-chalk-dim)] border-t-[var(--color-amber)] rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <ShoppingBasket className="w-10 h-10 text-[var(--color-chalk-dim)] mb-4" />
        <h3 className="font-display text-2xl mb-1">Your list is empty</h3>
        <p className="text-sm text-[var(--color-chalk-dim)] max-w-xs">
          Tap the mic and say something like <em>&ldquo;add two apples&rdquo;</em> or <em>&ldquo;I need milk&rdquo;</em>.
        </p>
      </div>
    );
  }

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category}>
          <h3 className="font-display text-lg text-[var(--color-amber)] mb-3">{category as Category}</h3>
          <div className="space-y-2.5">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`chalk-card flex items-center gap-3 px-4 py-3 transition-opacity ${
                  item.checked ? "opacity-45" : ""
                }`}
              >
                <button
                  onClick={() => toggleChecked(item.id)}
                  aria-label={item.checked ? "Mark as not picked up" : "Mark as picked up"}
                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.checked
                      ? "bg-[var(--color-sage)] border-[var(--color-sage)]"
                      : "border-[var(--color-chalk-dim)]"
                  }`}
                >
                  {item.checked && <Check className="w-4 h-4 text-[var(--color-board)]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${item.checked ? "line-through" : ""}`}>{item.name}</p>
                  {item.addedVia === "voice" && (
                    <p className="text-[10px] uppercase tracking-wide text-[var(--color-chalk-dim)]">by voice</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-[var(--color-board)] rounded-lg px-1.5 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-[var(--color-chalk-dim)] hover:text-[var(--color-coral)]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[var(--color-chalk-dim)] hover:text-[var(--color-sage)]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeById(item.id)}
                  className="text-[var(--color-chalk-dim)] hover:text-[var(--color-coral)] p-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
