"use client";

import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { useExpensesStore } from "@/modules/expenses/store";
import { ExpenseRow } from "@/modules/expenses/components/expense-row";
import { EmptyState } from "@/shared/components/empty-state";
import { useUIStore } from "@/shared/store/ui-store";

export function RecentList({ className }: { className?: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const openExpenseSheet = useUIStore((s) => s.openExpenseSheet);
  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
    .slice(0, 6);

  return (
    <Panel className={className}>
      <PanelHeader
        label="Recent activity"
        right={
          <Link
            href="/transactions"
            className="flex cursor-pointer items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-primary underline-offset-2 hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {recent.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Nothing logged yet"
          body="Your latest expenses will appear here the moment you file them."
          action={
            <button
              onClick={() => openExpenseSheet()}
              className="btn btn-primary btn-sm cursor-pointer"
            >
              Add first expense
            </button>
          }
        />
      ) : (
        <div className="divide-y divide-ink/10">
          {recent.map((e, i) => (
            <ExpenseRow key={e.id} expense={e} index={i} />
          ))}
        </div>
      )}
    </Panel>
  );
}
