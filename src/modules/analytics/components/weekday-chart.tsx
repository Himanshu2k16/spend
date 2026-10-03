"use client";

import { motion } from "framer-motion";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { WEEKDAY_LABELS } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { useExpensesStore } from "@/modules/expenses/store";
import { weekdayTotals } from "@/modules/expenses/utils/aggregate";
import type { Expense } from "@/modules/expenses/types";

export function WeekdayCard({
  expenses,
  className,
}: {
  expenses: Expense[];
  className?: string;
}) {
  const currency = useExpensesStore((s) => s.currency);
  const totals = weekdayTotals(expenses);
  const max = Math.max(...totals, 1);
  const peak = totals.indexOf(Math.max(...totals));

  return (
    <Panel className={cn(className)}>
      <PanelHeader label="Weekday rhythm" />
      <div className="p-5">
        <p className="mb-5 text-sm text-ink-soft">
          When the ledger gets busy —{" "}
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-accent">
            {WEEKDAY_LABELS[peak]} peaks
          </span>
        </p>

        <div className="space-y-3">
          {totals.map((v, i) => (
            <div key={WEEKDAY_LABELS[i]} className="flex items-center gap-3">
              <span
                className={cn(
                  "w-8 shrink-0 font-mono text-xs font-semibold uppercase",
                  i === peak && totals[peak] > 0 ? "text-accent" : "text-ink-faint"
                )}
              >
                {WEEKDAY_LABELS[i]}
              </span>
              <div className="h-3 flex-1 border border-ink/20 bg-paper">
                <motion.div
                  className={cn("h-full w-full", i === peak && totals[peak] > 0 ? "bg-accent" : "bg-ink/70")}
                  style={{ transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: v / max }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.15 + i * 0.06 }}
                />
              </div>
              <span className="tnum w-16 shrink-0 text-right font-mono text-[11px] text-ink-soft">
                {v > 0 ? formatMoney(v, currency, { decimals: false, compact: true }) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
