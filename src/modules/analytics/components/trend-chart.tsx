"use client";

import { motion } from "framer-motion";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { DeltaChip } from "@/shared/components/delta-chip";
import { springSoft } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { useExpensesStore } from "@/modules/expenses/store";
import { monthSeries } from "@/modules/expenses/utils/aggregate";
import { monthLabel } from "@/shared/lib/dates";

/** Six-month rhythm — hatched history, solid current month, ink baseline. */
export function TrendCard({ month, className }: { month: string; className?: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const series = monthSeries(expenses, month, 6);

  const max = Math.max(...series.map((s) => s.total), 1);
  const current = series[series.length - 1]?.total ?? 0;
  const previous = series[series.length - 2]?.total ?? 0;
  const delta = previous > 0 ? ((current - previous) / previous) * 100 : null;

  return (
    <Panel className={cn(className)}>
      <PanelHeader
        label="Six-month rhythm"
        right={<DeltaChip value={delta} invert suffix="MoM" />}
      />

      <div className="p-5">
        <div className="flex h-44 items-end gap-2.5 border-b-2 border-ink pb-0 sm:gap-3.5">
          {series.map((s, i) => {
            const pct = s.total / max;
            const isCurrent = i === series.length - 1;
            return (
              <div
                key={s.key}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span
                  className={cn(
                    "tnum font-mono text-[11px] font-semibold transition-opacity duration-150",
                    isCurrent ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {s.total > 0
                    ? formatMoney(s.total, currency, { compact: true, decimals: false })
                    : "—"}
                </span>
                <div className="flex h-full w-full items-end justify-center">
                  <motion.div
                    className={cn(
                      "w-full max-w-[46px]",
                      isCurrent
                        ? "bg-primary"
                        : "group-hover:bg-ink/25 hatch-bar"
                    )}
                    style={{
                      height: `${Math.max(pct * 100, s.total > 0 ? 4 : 1.5)}%`,
                      transformOrigin: "bottom",
                    }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...springSoft, delay: 0.1 + i * 0.08 }}
                  />
                </div>
                <span
                  className={cn(
                    "-mb-5 bg-paper px-1 pb-1 font-mono text-[10px] font-semibold uppercase tracking-wide",
                    isCurrent ? "text-primary" : "text-ink-faint"
                  )}
                >
                  {monthLabel(s.key, "short").split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-5" />
      </div>
    </Panel>
  );
}
