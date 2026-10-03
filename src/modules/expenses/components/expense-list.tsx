"use client";

import { AnimatePresence } from "framer-motion";
import { friendlyDate } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { useExpensesStore } from "../store";
import type { Expense } from "../types";
import { ExpenseRow } from "./expense-row";

interface Group {
  iso: string;
  items: Expense[];
  total: number;
}

function groupByDate(expenses: Expense[]): Group[] {
  const map = new Map<string, Group>();
  for (const e of expenses) {
    const g = map.get(e.date) ?? { iso: e.date, items: [], total: 0 };
    g.items.push(e);
    g.total += e.amount;
    map.set(e.date, g);
  }
  return [...map.values()];
}

/** Day-ruled ledger pages. Expects a pre-sorted list. */
export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const currency = useExpensesStore((s) => s.currency);
  const groups = groupByDate(expenses);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.iso} className="border border-ink/20 bg-surface">
          <div className="flex items-baseline justify-between border-b border-ink/15 bg-surface-deep/60 px-3.5 py-2">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {friendlyDate(group.iso)}
            </p>
            <p className="tnum font-mono text-xs font-semibold text-ink-soft">
              {formatMoney(group.total, currency)}
            </p>
          </div>
          <div className="divide-y divide-ink/10">
            <AnimatePresence initial={false}>
              {group.items.map((e, i) => (
                <ExpenseRow key={e.id} expense={e} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}
