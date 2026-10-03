"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { getCategory } from "@/modules/categories";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { friendlyDate } from "@/shared/lib/dates";
import { useUIStore } from "@/shared/store/ui-store";
import { methodLabel } from "../constants";
import { useExpensesStore } from "../store";
import type { Expense } from "../types";

/** Receipt line: item … dotted leader … amount. */
export function ExpenseRow({
  expense,
  index = 0,
}: {
  expense: Expense;
  index?: number;
}) {
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);
  const currency = useExpensesStore((s) => s.currency);
  const cat = getCategory(expense.categoryId);
  const Icon = cat.icon;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.04, 0.3) }}
      onClick={() => openExpenseSheet(expense.id)}
      className="group flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-primary/6"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center border border-ink/20 bg-paper transition-colors duration-150 group-hover:border-ink/40">
        <Icon className="h-4 w-4" style={{ color: cat.color }} />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{expense.note || cat.label}</span>
        <span className="block truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {friendlyDate(expense.date)} · {methodLabel(expense.method)} · {cat.label}
        </span>
      </span>

      <span className="leader mx-1 hidden min-[420px]:block" aria-hidden />

      <span className="tnum shrink-0 font-mono text-sm font-semibold">
        {formatMoney(expense.amount, currency)}
      </span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
    </motion.button>
  );
}
