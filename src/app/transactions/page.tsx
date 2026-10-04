"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Panel } from "@/shared/components/panel";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import { formatMoney } from "@/shared/lib/money";
import { useUIStore } from "@/shared/store/ui-store";
import { useExpensesStore } from "@/modules/expenses/store";
import { sumAmounts } from "@/modules/expenses/utils/aggregate";
import {
  DEFAULT_FILTERS,
  ExpenseFilters,
  filterSortExpenses,
  type Filters,
} from "@/modules/expenses/components/expense-filters";
import { ExpenseList } from "@/modules/expenses/components/expense-list";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);

  const filtered = useMemo(() => filterSortExpenses(expenses, filters), [expenses, filters]);

  return (
    <div>
      <PageHeader
        index="03"
        overline="History"
        title="Transactions"
        subtitle={`${expenses.length} recorded · ${formatMoney(sumAmounts(expenses), currency)} lifetime`}
      />

      <ExpenseFilters value={filters} onChange={setFilters} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <Panel className="p-4">
          <EmptyState
            icon={ArrowLeftRight}
            title={expenses.length === 0 ? "No transactions yet" : "Nothing matches those filters"}
            body={
              expenses.length === 0
                ? "Log your first expense and it will land right here."
                : "Try a different search term, category or payment method."
            }
            action={
              expenses.length === 0 ? (
                <button
                  onClick={() => openExpenseSheet()}
                  className="cursor-pointer rounded-full bg-gradient-to-r from-brand to-viol px-4 py-2 text-sm font-semibold text-white shadow-glow-brand transition hover:brightness-110"
                >
                  Add expense
                </button>
              ) : (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-dim transition hover:bg-white/5 hover:text-ink"
                >
                  Reset filters
                </button>
              )
            }
          />
        </Panel>
      ) : (
        <ExpenseList expenses={filtered} />
      )}
    </div>
  );
}
