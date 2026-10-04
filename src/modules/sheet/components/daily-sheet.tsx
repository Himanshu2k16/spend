"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Dropdown } from "@/shared/components/dropdown";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { currentMonthKey, daysInMonthKey, isoOf, monthLabel, todayISO } from "@/shared/lib/dates";
import { currencySymbol, formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { CATEGORIES, type CategoryId } from "@/modules/categories";
import { PAYMENT_METHODS } from "@/modules/expenses/constants";
import { useExpensesStore } from "@/modules/expenses/store";
import type { PaymentMethod } from "@/modules/expenses/types";

/** Weekday (Mon-first) for a day of the given month key. */
function weekdayOf(monthKey: string, day: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, day)
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
}

/**
 * Excel-style daily entry sheet: one row per day of the month.
 * Type an amount → Enter files the expense and moves the cursor down.
 * Today's row is highlighted and scrolled into view automatically.
 */
export function DailySheet({ month }: { month: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const addExpense = useExpensesStore((s) => s.addExpense);

  const [quickCategory, setQuickCategory] = useState<CategoryId>("other");
  const [quickMethod, setQuickMethod] = useState<PaymentMethod>("card");
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [flashDay, setFlashDay] = useState<number | null>(null);
  const [errorDay, setErrorDay] = useState<number | null>(null);

  const todayRowRef = useRef<HTMLTableRowElement | null>(null);
  const amountRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const dim = daysInMonthKey(month);
  const isCurrentMonth = month === currentMonthKey();
  const todayDay = Number(todayISO().slice(8, 10));

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(month)),
    [expenses, month]
  );
  const byDate = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const e of monthExpenses) {
      const g = map.get(e.date) ?? { total: 0, count: 0 };
      g.total += e.amount;
      g.count += 1;
      map.set(e.date, g);
    }
    return map;
  }, [monthExpenses]);
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Keep today in view when the sheet opens or the month changes.
  useEffect(() => {
    const t = setTimeout(
      () => todayRowRef.current?.scrollIntoView({ block: "center" }),
      300
    );
    return () => clearTimeout(t);
  }, [month]);

  function isDayDisabled(day: number): boolean {
    return isCurrentMonth && day > todayDay;
  }

  function commit(day: number) {
    const amount = Number.parseFloat(amounts[day] ?? "");
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorDay(day);
      setTimeout(() => setErrorDay(null), 650);
      return;
    }
    addExpense({
      amount: Math.round(amount * 100) / 100,
      categoryId: quickCategory,
      date: isoOf(month, day),
      note: (notes[day] ?? "").trim(),
      method: quickMethod,
    });
    setFlashDay(day);
    setTimeout(() => setFlashDay(null), 800);
    setAmounts((a) => ({ ...a, [day]: "" }));
    setNotes((n) => ({ ...n, [day]: "" }));

    // Excel behaviour: cursor drops to the next editable row.
    let target = day;
    for (let d = day + 1; d <= dim; d++) {
      if (!isDayDisabled(d)) {
        target = d;
        break;
      }
    }
    const el = amountRefs.current.get(target);
    el?.focus();
    el?.select();
  }

  const cellBase = "border-r border-ink/10 px-3 py-2 align-middle";

  return (
    <Panel>
      <PanelHeader
        label={`Daily sheet — ${monthLabel(month)}`}
        right={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Dropdown
              size="sm"
              className="w-[160px]"
              ariaLabel="Quick-entry category"
              value={quickCategory}
              onChange={(v) => setQuickCategory(v as CategoryId)}
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Dropdown
              size="sm"
              className="w-[110px]"
              ariaLabel="Quick-entry payment method"
              value={quickMethod}
              onChange={(v) => setQuickMethod(v as PaymentMethod)}
              options={PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.label }))}
            />
            <button
              onClick={() =>
                todayRowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
              }
              disabled={!isCurrentMonth}
              className={cn("btn btn-ghost btn-sm", isCurrentMonth && "cursor-pointer")}
            >
              Today
            </button>
          </div>
        }
      />

      <p className="border-b border-ink/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        Type an amount → press Enter → it files into the ledger and the cursor moves down.
        Entries use the category & method chosen above.
      </p>

      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[680px] table-fixed border-collapse">
          <thead>
            <tr aria-hidden>
              <th className="sticky top-0 z-20 h-6 w-10 border-b border-ink/10 bg-surface-deep/70" />
              {["A", "B", "C", "D", "E"].map((letter) => (
                <th
                  key={letter}
                  className="sticky top-0 z-20 h-6 border-b border-l border-ink/10 bg-surface-deep/70 text-center font-mono text-[9px] font-semibold text-ink-faint"
                >
                  {letter}
                </th>
              ))}
            </tr>
            <tr>
              <th className="sticky top-6 z-20 w-10 border-b border-ink/15 bg-surface px-1 py-2 text-center label-mono">
                Day
              </th>
              <th className="sticky top-6 z-20 w-[112px] border-b border-l border-ink/15 bg-surface px-3 py-2 text-left label-mono">
                Date
              </th>
              <th className="sticky top-6 z-20 w-[168px] border-b border-l border-ink/15 bg-surface px-3 py-2 text-left label-mono">
                Spent
              </th>
              <th className="sticky top-6 z-20 border-b border-l border-ink/15 bg-surface px-3 py-2 text-left label-mono">
                Note
              </th>
              <th className="sticky top-6 z-20 w-[84px] border-b border-l border-ink/15 bg-surface px-2 py-2 text-center label-mono">
                Entries
              </th>
              <th className="sticky top-6 z-20 w-[128px] border-b border-l border-ink/15 bg-surface px-3 py-2 text-right label-mono">
                Day total
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: dim }, (_, i) => i + 1).map((day) => {
              const iso = isoOf(month, day);
              const stats = byDate.get(iso);
              const isToday = isCurrentMonth && day === todayDay;
              const disabled = isDayDisabled(day);
              return (
                <tr
                  key={day}
                  ref={isToday ? todayRowRef : undefined}
                  className={cn(
                    "group border-b border-ink/8 transition-colors duration-150",
                    !isToday && day % 2 === 0 && "bg-surface-deep/25",
                    isToday && "bg-primary/8",
                    flashDay === day && "bg-primary/20",
                    disabled && "opacity-35"
                  )}
                >
                  <td className="border-r border-ink/10 py-2 text-center font-mono text-[10px] text-ink-faint">
                    {day}
                  </td>
                  <td className={cn(cellBase, "w-[112px]")}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-ink-faint">
                        {weekdayOf(month, day)}
                      </span>
                      <span className="tnum font-mono text-sm font-semibold">
                        {String(day).padStart(2, "0")}
                      </span>
                      {isToday && (
                        <span className="bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-on-primary">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={cn(cellBase, "w-[168px] p-0")}>
                    <div
                      className={cn(
                        "flex h-full items-center gap-1.5 px-2.5 py-2 transition-colors focus-within:bg-primary/10",
                        errorDay === day && "bg-negative/15"
                      )}
                    >
                      <span className="font-mono text-xs text-ink-faint">
                        {currencySymbol(currency)}
                      </span>
                      <input
                        ref={(el) => {
                          if (el) amountRefs.current.set(day, el);
                          else amountRefs.current.delete(day);
                        }}
                        value={amounts[day] ?? ""}
                        disabled={disabled}
                        onChange={(e) =>
                          setAmounts((a) => ({
                            ...a,
                            [day]: e.target.value.replace(/[^0-9.]/g, ""),
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commit(day);
                        }}
                        inputMode="decimal"
                        placeholder="0.00"
                        aria-label={`Amount spent on day ${day}`}
                        className="tnum w-full bg-transparent font-mono text-sm font-semibold outline-none placeholder:text-ink-faint/50"
                      />
                      <CornerDownLeft className="h-3 w-3 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-70" />
                    </div>
                  </td>
                  <td className={cn(cellBase, "p-0")}>
                    <input
                      value={notes[day] ?? ""}
                      disabled={disabled}
                      onChange={(e) => setNotes((n) => ({ ...n, [day]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commit(day);
                      }}
                      maxLength={80}
                      placeholder="What was it? (optional)"
                      aria-label={`Note for day ${day}`}
                      className="h-full w-full bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-ink-faint/50 focus:bg-primary/10"
                    />
                  </td>
                  <td className="border-l border-ink/10 px-2 py-2 text-center">
                    <span className="tnum font-mono text-xs text-ink-faint">
                      {stats ? `×${stats.count}` : "·"}
                    </span>
                  </td>
                  <td className="border-l border-ink/10 px-3 py-2 text-right">
                    <span className="tnum font-mono text-sm font-semibold">
                      {stats && stats.total > 0 ? formatMoney(stats.total, currency) : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="sticky bottom-0 z-20 bg-surface">
              <td
                colSpan={4}
                className="border-t-2 border-ink px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.14em]"
              >
                Σ Month total · {monthExpenses.length} entries
              </td>
              <td className="border-t-2 border-l border-ink px-2 py-2.5 text-center">
                <span className="tnum font-mono text-xs font-semibold">
                  ×{monthExpenses.length}
                </span>
              </td>
              <td className="border-t-2 border-l border-ink px-3 py-2.5 text-right">
                <span className="tnum font-mono text-sm font-bold">
                  {formatMoney(monthTotal, currency)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}
