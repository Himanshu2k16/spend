"use client";

import { ListFilter, Search } from "lucide-react";
import { CATEGORIES, getCategory, type CategoryId } from "@/modules/categories";
import { Dropdown } from "@/shared/components/dropdown";
import { PAYMENT_METHODS } from "../constants";
import type { Expense, PaymentMethod } from "../types";
import { cn } from "@/shared/lib/utils";

export type SortMode = "newest" | "oldest" | "largest";

export interface Filters {
  q: string;
  category: CategoryId | "all";
  method: PaymentMethod | "all";
  sort: SortMode;
}

export const DEFAULT_FILTERS: Filters = { q: "", category: "all", method: "all", sort: "newest" };

export function filterSortExpenses(list: Expense[], f: Filters): Expense[] {
  const q = f.q.trim().toLowerCase();
  const out = list.filter((e) => {
    if (f.category !== "all" && e.categoryId !== f.category) return false;
    if (f.method !== "all" && e.method !== f.method) return false;
    if (!q) return true;
    const inNote = e.note.toLowerCase().includes(q);
    const inCategory = getCategory(e.categoryId).label.toLowerCase().includes(q);
    return inNote || inCategory;
  });
  out.sort((a, b) => {
    switch (f.sort) {
      case "oldest":
        return a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt;
      case "largest":
        return b.amount - a.amount;
      default:
        return a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt;
    }
  });
  return out;
}

export function ExpenseFilters({
  value,
  onChange,
  resultCount,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-11 min-w-[200px] flex-1 cursor-text items-center gap-2.5 border border-ink/40 bg-surface px-3.5 transition-colors focus-within:border-primary">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            value={value.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search notes or categories…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
            aria-label="Search expenses"
          />
        </label>

        <div className="flex h-11 items-stretch border border-ink/40 bg-surface">
          <span className="grid w-9 place-items-center border-r border-ink/20 text-ink-faint">
            <ListFilter className="h-4 w-4" aria-hidden />
          </span>
          {(
            [
              ["newest", "Newest"],
              ["oldest", "Oldest"],
              ["largest", "Largest"],
            ] as Array<[SortMode, string]>
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => set({ sort: mode })}
              aria-pressed={value.sort === mode}
              className={cn(
                "cursor-pointer px-3.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
                value.sort === mode ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="-mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-1 scrollbar-none">
          <FilterChip
            active={value.category === "all"}
            onClick={() => set({ category: "all" })}
            label="All"
          />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={value.category === c.id}
              onClick={() => set({ category: c.id })}
              label={c.label}
              dotColor={c.color}
            />
          ))}
        </div>

        <Dropdown
          ariaLabel="Filter by payment method"
          size="sm"
          className="w-[150px] shrink-0"
          value={value.method}
          onChange={(v) => set({ method: v as PaymentMethod | "all" })}
          options={[
            { value: "all", label: "All methods" },
            ...PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.label })),
          ]}
        />

        <span className="tnum hidden shrink-0 font-mono text-xs text-ink-faint sm:block">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dotColor,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors duration-150",
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/25 bg-surface text-ink-soft hover:border-ink/50 hover:text-ink"
      )}
    >
      {dotColor && (
        <span
          className="h-2 w-2 shrink-0"
          style={{ background: dotColor }}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
