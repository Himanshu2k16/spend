"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { Dropdown } from "@/shared/components/dropdown";
import { currentMonthKey, daysInMonthKey } from "@/shared/lib/dates";
import { springSoft } from "@/shared/lib/motion";
import { currencySymbol, formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { CATEGORIES, getCategory, type CategoryId } from "@/modules/categories";
import { useExpensesStore } from "@/modules/expenses/store";
import { categoryTotals, expensesInMonth } from "@/modules/expenses/utils/aggregate";
import type { Expense } from "@/modules/expenses/types";

const R = 52;
const C = 2 * Math.PI * R;

export function BudgetBoard({ month, expenses }: { month: string; expenses: Expense[] }) {
  const currency = useExpensesStore((s) => s.currency);
  const budgets = useExpensesStore((s) => s.budgets);
  const overallBudget = useExpensesStore((s) => s.overallBudget);
  const setOverallBudget = useExpensesStore((s) => s.setOverallBudget);
  const setBudget = useExpensesStore((s) => s.setBudget);

  const cur = expensesInMonth(expenses, month);
  const spentByCategory = new Map(categoryTotals(cur).map((c) => [c.categoryId, c.total]));
  const spentTotal = cur.reduce((s, e) => s + e.amount, 0);

  const overall =
    overallBudget ?? Object.values(budgets).reduce<number>((a, v) => a + (v ?? 0), 0);
  const pct = overall > 0 ? Math.min(1, spentTotal / overall) : 0;
  const over = overall > 0 && spentTotal > overall;
  const ringColor = over ? "var(--color-negative)" : "var(--color-primary)";

  const isCurrentMonth = month === currentMonthKey();
  const dayN = isCurrentMonth ? new Date().getDate() : daysInMonthKey(month);
  const dim = daysInMonthKey(month);
  const expectedPace = overall > 0 ? (overall * dayN) / dim : 0;
  const paceState =
    overall <= 0 ? null : spentTotal > expectedPace * 1.1 ? "ahead" : "ontrack";

  const budgetedIds = Object.keys(budgets) as CategoryId[];
  const available = CATEGORIES.filter((c) => !(c.id in budgets));

  return (
    <div className="space-y-5">
      <Panel>
        <PanelHeader label="Overall monthly limit" />
        <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:p-8">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="rgba(33,29,22,0.14)"
                strokeWidth="12"
              />
              <motion.circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth="12"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (overall > 0 ? 1 - pct : 1) }}
                transition={springSoft}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "tnum font-mono text-[28px] font-semibold leading-none",
                  over && "text-negative"
                )}
              >
                {overall > 0 ? `${Math.round((spentTotal / overall) * 100)}%` : "—"}
              </span>
              <span className="label-mono mt-1.5">of budget</span>
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <OverallBudgetInput
              value={overallBudget}
              display={
                overallBudget != null ? formatMoney(overallBudget, currency) : "Not set"
              }
              onSave={setOverallBudget}
              symbol={currencySymbol(currency)}
            />
            {overall > 0 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <span className="border border-ink/30 bg-paper px-3.5 py-1.5 font-mono text-xs">
                  <span className="tnum font-semibold">{formatMoney(spentTotal, currency)}</span>
                  <span className="text-ink-soft">
                    {" "}
                    spent · {formatMoney(Math.max(0, overall - spentTotal), currency)} left
                  </span>
                </span>
                {paceState === "ontrack" ? (
                  <span className="stamp text-primary">
                    <TrendingDown className="h-3 w-3" /> On pace
                  </span>
                ) : paceState === "ahead" ? (
                  <span className="stamp text-negative">
                    <TrendingUp className="h-3 w-3" /> Ahead of pace
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                Set a total limit, or leave it empty to let category envelopes add up.
              </p>
            )}
          </div>
        </div>
      </Panel>

      {budgetedIds.length === 0 && available.length === CATEGORIES.length ? (
        <Panel className="p-6">
          <EmptyState
            icon={Check}
            title="Zero envelopes yet"
            body="Assign monthly limits to the categories that matter — food, transport, fun — and watch the columns do the talking."
          />
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 gap-px border border-ink/20 bg-ink/15 sm:grid-cols-2 xl:grid-cols-3">
        {budgetedIds.map((id, i) => {
          const cat = getCategory(id);
          const limit = budgets[id] ?? 0;
          const spent = spentByCategory.get(id) ?? 0;
          const rowPct = Math.min(1, spent / (limit || 1));
          const rowOver = spent > limit;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-surface p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center border border-ink/20 bg-paper"
                    aria-hidden
                  >
                    <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                  </span>
                  <span className="truncate text-sm font-semibold">{cat.label}</span>
                </div>
                <button
                  onClick={() => setBudget(id, null)}
                  aria-label={`Remove ${cat.label} budget`}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center border border-ink/20 text-ink-faint transition hover:border-negative hover:text-negative"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className={cn("tnum font-mono text-2xl font-semibold", rowOver && "text-negative")}
                >
                  {formatMoney(spent, currency)}
                </span>
                <span className="tnum font-mono text-xs text-ink-faint">
                  of {formatMoney(limit, currency, { decimals: false })}
                </span>
              </div>

              <div className="mt-3 h-2 border border-ink/25 bg-paper">
                <motion.div
                  className={cn("h-full", rowOver ? "bg-negative" : "")}
                  style={rowOver ? undefined : { background: cat.color, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: rowPct }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className={cn("font-mono text-[11px] uppercase tracking-wide", rowOver ? "text-negative" : "text-ink-soft")}>
                  {rowOver
                    ? `Over by ${formatMoney(spent - limit, currency, { decimals: false })}`
                    : `${formatMoney(limit - spent, currency, { decimals: false })} left`}
                </p>
                <LimitStepper
                  value={limit}
                  symbol={currencySymbol(currency)}
                  onSave={(v) => setBudget(id, v)}
                />
              </div>
            </motion.div>
          );
        })}

        {available.length > 0 && <AddBudgetCard available={available} />}
      </div>
    </div>
  );
}

function OverallBudgetInput({
  value,
  display,
  onSave,
  symbol,
}: {
  value: number | null;
  display: string;
  onSave: (v: number | null) => void;
  symbol: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const n = Number.parseFloat(draft);
    onSave(Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setDraft(value != null ? String(value) : "");
          setEditing(true);
        }}
        className="group mt-1 flex cursor-pointer items-baseline gap-2 px-1 py-1 transition-colors hover:bg-ink/4"
      >
        <span className="tnum font-mono text-3xl font-semibold tracking-tight">{display}</span>
        <Pencil className="h-3.5 w-3.5 self-center text-ink-faint opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex items-center gap-1.5 border border-primary bg-surface px-3 py-2">
        <span className="font-mono text-ink-faint">{symbol}</span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          inputMode="decimal"
          placeholder="2000"
          aria-label="Overall monthly budget"
          className="tnum w-28 bg-transparent font-mono text-xl font-semibold outline-none"
        />
      </div>
      <button
        onClick={commit}
        aria-label="Save budget"
        className="grid h-10 w-10 cursor-pointer place-items-center border border-primary bg-primary/10 text-primary transition hover:bg-primary/20"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={() => setEditing(false)}
        aria-label="Cancel"
        className="grid h-10 w-10 cursor-pointer place-items-center border border-ink/30 text-ink-faint transition hover:bg-ink/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function LimitStepper({
  value,
  symbol,
  onSave,
}: {
  value: number;
  symbol: string;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const n = Number.parseFloat(draft);
    if (Number.isFinite(n) && n > 0) onSave(Math.round(n * 100) / 100);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        className="flex cursor-pointer items-center gap-1 px-1.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/10"
      >
        <Pencil className="h-3 w-3" /> Edit limit
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        inputMode="decimal"
        aria-label={`New limit (${symbol})`}
        className="tnum w-20 border border-primary bg-surface px-2 py-1 font-mono text-xs outline-none"
      />
      <button
        onClick={commit}
        aria-label="Save limit"
        className="grid h-7 w-7 cursor-pointer place-items-center border border-primary bg-primary/10 text-primary transition hover:bg-primary/20"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AddBudgetCard({ available }: { available: typeof CATEGORIES }) {
  const setBudget = useExpensesStore((s) => s.setBudget);
  const [categoryId, setCategoryId] = useState<CategoryId | "">(available[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [added, setAdded] = useState(false);

  function add() {
    const n = Number.parseFloat(amount);
    if (!categoryId || !Number.isFinite(n) || n <= 0) return;
    setBudget(categoryId, Math.round(n * 100) / 100);
    setAmount("");
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div className="flex flex-col justify-between gap-4 bg-paper p-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center border border-dashed border-ink/40">
          <Plus className="h-4 w-4 text-primary" />
        </span>
        <span className="label-mono">New envelope</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <Dropdown
          ariaLabel="Category to budget"
          value={available.some((c) => c.id === categoryId) ? categoryId : available[0]?.id ?? ""}
          onChange={(v) => setCategoryId(v as CategoryId)}
          options={available.map((c) => ({ value: c.id, label: c.label }))}
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          inputMode="decimal"
          placeholder="Monthly limit, e.g. 400"
          className="field tnum font-mono"
        />
        <motion.button
          onClick={add}
          whileTap={{ scale: 0.98 }}
          className={cn("btn cursor-pointer w-full", added ? "btn-primary" : "btn-primary")}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {added ? "Filed" : "Add envelope"}
        </motion.button>
      </div>
    </div>
  );
}
