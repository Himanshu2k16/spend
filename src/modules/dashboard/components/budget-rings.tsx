"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { springSoft } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { getCategory, type CategoryId } from "@/modules/categories";
import { useExpensesStore } from "@/modules/expenses/store";
import { categoryTotals, expensesInMonth } from "@/modules/expenses/utils/aggregate";

const R = 56;
const STROKE = 11;
const C = 2 * Math.PI * R;

export function BudgetRings({ month, className }: { month: string; className?: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const budgets = useExpensesStore((s) => s.budgets);
  const overallBudget = useExpensesStore((s) => s.overallBudget);

  const cur = expensesInMonth(expenses, month);
  const spentTotal = cur.reduce((s, e) => s + e.amount, 0);
  const budgetTotal =
    overallBudget ?? Object.values(budgets).reduce<number>((a, v) => a + (v ?? 0), 0);

  const spentByCategory = new Map(categoryTotals(cur).map((c) => [c.categoryId, c.total]));
  const rows = Object.entries(budgets)
    .map(([id, limit]) => ({
      categoryId: id as CategoryId,
      limit: limit ?? 0,
      spent: spentByCategory.get(id) ?? 0,
    }))
    .sort((a, b) => b.spent / (b.limit || 1) - a.spent / (a.limit || 1))
    .slice(0, 4);

  const pct = budgetTotal > 0 ? Math.min(1, spentTotal / budgetTotal) : 0;
  const over = budgetTotal > 0 && spentTotal > budgetTotal;
  const ringColor = over ? "var(--color-negative)" : "var(--color-primary)";

  return (
    <Panel className={cn("flex flex-col", className)}>
      <PanelHeader
        label="Budget health"
        right={
          <Link
            href="/budgets"
            className="flex cursor-pointer items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary underline-offset-2 hover:underline"
          >
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {budgetTotal <= 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
          <p className="text-sm text-ink-soft">
            No budgets yet. Set an overall limit or per-category envelopes to see live pacing here.
          </p>
          <Link href="/budgets" className="btn btn-primary btn-sm cursor-pointer">
            Create a budget
          </Link>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex justify-center">
            <div className="relative h-[148px] w-[148px]">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke="var(--chart-track)"
                  strokeWidth={STROKE}
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={STROKE}
                  strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * (1 - pct) }}
                  transition={springSoft}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={cn(
                    "tnum font-mono text-2xl font-semibold",
                    over && "text-negative"
                  )}
                >
                  {Math.round((spentTotal / budgetTotal) * 100)}%
                </span>
                <span className="label-mono">used</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {rows.map((row) => {
              const cat = getCategory(row.categoryId);
              const rowPct = Math.min(1, row.spent / (row.limit || 1));
              const rowOver = row.spent > row.limit;
              return (
                <div key={row.categoryId}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0"
                        style={{ background: cat.color }}
                        aria-hidden
                      />
                      <span className="truncate font-medium text-ink-soft">{cat.label}</span>
                    </span>
                    <span className={cn("tnum shrink-0 font-mono", rowOver && "text-negative")}>
                      {formatMoney(row.spent, currency, { decimals: false })} /{" "}
                      {formatMoney(row.limit, currency, { decimals: false })}
                    </span>
                  </div>
                  <div className="h-1.5 border border-ink/20 bg-paper">
                    <motion.div
                      className={cn("h-full", rowOver ? "bg-negative" : "")}
                      style={
                        rowOver ? undefined : { background: cat.color, transformOrigin: "left" }
                      }
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: rowPct }}
                      transition={{ duration: 0.7, delay: 0.25 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}
