"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Ledger-styled dropdown — replaces native selects everywhere.
 * Keyboard: arrows/Home/End navigate, Enter selects, Esc closes.
 * `searchable` adds a type-to-filter field for long lists.
 */
export function Dropdown({
  value,
  onChange,
  options,
  size = "md",
  className,
  searchable = false,
  disabled = false,
  ariaLabel,
  emptyLabel = "No matches",
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  size?: "sm" | "md";
  className?: string;
  searchable?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.hint ?? "").toLowerCase().includes(q)
    );
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = filtered.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open, filtered.length]);

  function commit(option: DropdownOption) {
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => Math.min(filtered.length - 1, h + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(Math.max(0, filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlight]) commit(filtered[highlight]);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 border bg-surface text-left transition-colors",
          size === "sm" ? "h-9 px-2.5 font-mono text-[11px] uppercase tracking-wide" : "px-3.5 py-2.5",
          open ? "border-primary" : "border-rule-strong hover:border-ink",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
      >
        <span className="min-w-0 truncate font-mono">
          {selected ? (
            <>
              <span className="font-semibold">{selected.label}</span>
              {selected.hint ? (
                <span className="ml-2 text-ink-faint">{selected.hint}</span>
              ) : null}
            </>
          ) : (
            <span className="text-ink-faint">Select…</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[calc(100%+6px)] z-40 border-2 border-ink bg-surface shadow-lift"
          >
            {searchable && (
              <div className="border-b border-ink/15 p-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  placeholder="Type to filter…"
                  aria-label="Filter options"
                  className="field py-2 font-mono text-xs uppercase"
                />
              </div>
            )}
            <div
              ref={listRef}
              role="listbox"
              id={listboxId}
              aria-label={ariaLabel}
              className="max-h-72 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <p className="px-3.5 py-3 font-mono text-xs uppercase tracking-wide text-ink-faint">
                  {emptyLabel}
                </p>
              ) : (
                filtered.map((option, i) => {
                  const active = i === highlight;
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-index={i}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => commit(option)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors duration-100",
                        active ? "bg-ink/6" : "",
                        isSelected ? "text-primary" : "text-ink"
                      )}
                    >
                      <span className="min-w-0 truncate font-mono text-sm">
                        <span className="font-semibold">{option.label}</span>
                        {option.hint ? (
                          <span className="ml-2 text-xs font-normal text-ink-faint">
                            {option.hint}
                          </span>
                        ) : null}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
