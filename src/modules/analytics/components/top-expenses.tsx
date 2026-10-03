"use client";

import { motion } from "framer-motion";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { getCategory } from "@/modules/categories";
import { useExpensesStore } from "@/modules/expenses/store";
import { friendlyDate } from "@/shared/lib/dates";
import { EmptyState } from "@/shared/components/empty-state";
import { Crown } from "lucide-react";
import type { Expense } from "@/modules/expenses/types";

export function TopExpensesCard({
  expenses,
  className,
}: {
  expenses: Expense[];
  className?: string;
}) {
  const currency = useExpensesStore((s) => s.currency);
  const top = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <Panel className={cn(className)}>
      <PanelHeader label="Heavy hitters — five largest entries" />
      {top.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="Nothing to rank"
          body="Once you log expenses this month, the biggest ones will show up here."
        />
      ) : (
        <ol className="divide-y divide-ink/10">
          {top.map((e, i) => {
            const cat = getCategory(e.categoryId);
            const Icon = cat.icon;
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: i * 0.06 }}
                className="flex items-center gap-3.5 px-4 py-2.5 transition-colors hover:bg-primary/6"
              >
                <span
                  className={`tnum w-6 shrink-0 text-center font-mono text-sm font-semibold ${
                    i === 0 ? "text-accent" : "text-ink-faint"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/20 bg-paper">
                  <Icon className="h-4 w-4" style={{ color: cat.color }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{e.note || cat.label}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {friendlyDate(e.date)}
                  </span>
                </span>
                <span className="leader hidden min-[420px]:block" aria-hidden />
                <span className="tnum shrink-0 font-mono text-sm font-semibold">
                  {formatMoney(e.amount, currency)}
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
