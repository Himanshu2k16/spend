"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { todayISO } from "@/shared/lib/dates";
import { springSnappy } from "@/shared/lib/motion";
import { currencySymbol } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { useUIStore } from "@/shared/store/ui-store";
import { CATEGORIES, type CategoryId } from "@/modules/categories";
import { PAYMENT_METHODS } from "../constants";
import { useExpensesStore } from "../store";
import type { PaymentMethod } from "../types";

interface FormState {
  amount: string;
  categoryId: CategoryId;
  date: string;
  note: string;
  method: PaymentMethod;
}

const emptyForm = (): FormState => ({
  amount: "",
  categoryId: "food",
  date: todayISO(),
  note: "",
  method: "card",
});

/** Entry slip — an expense written into the ledger like a receipt. */
export function ExpenseSheet() {
  const { open, editingId } = useUIStore((s) => s.expenseSheet);
  const closeExpenseSheet = useUIStore((s) => s.closeExpenseSheet);
  const addExpense = useExpensesStore((s) => s.addExpense);
  const updateExpense = useExpensesStore((s) => s.updateExpense);
  const deleteExpense = useExpensesStore((s) => s.deleteExpense);
  const currency = useExpensesStore((s) => s.currency);

  const editing =
    open && editingId
      ? useExpensesStore.getState().expenses.find((e) => e.id === editingId) ?? null
      : null;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const src = editingId
      ? useExpensesStore.getState().expenses.find((e) => e.id === editingId) ?? null
      : null;
    setForm(
      src
        ? {
            amount: String(src.amount),
            categoryId: src.categoryId,
            date: src.date,
            note: src.note,
            method: src.method,
          }
        : emptyForm()
    );
    setError(false);
    setSaved(false);
    setConfirmDelete(false);
    const t = setTimeout(() => amountRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [open, editingId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExpenseSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeExpenseSheet]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function submit() {
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(true);
      setTimeout(() => setError(false), 650);
      return;
    }
    const payload = {
      amount: Math.round(amount * 100) / 100,
      categoryId: form.categoryId,
      date: form.date || todayISO(),
      note: form.note.trim(),
      method: form.method,
    };
    if (editing) updateExpense(editing.id, payload);
    else addExpense(payload);
    setSaved(true);
    setTimeout(closeExpenseSheet, 420);
  }

  const sym = currencySymbol(currency);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit expense" : "Add expense"}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="scrim absolute inset-0"
              onClick={closeExpenseSheet}
            />

            <motion.div
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 44 }}
              transition={springSnappy}
              className="relative flex max-h-[92dvh] w-full max-w-lg flex-col border-2 border-ink bg-surface shadow-lift"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-ink/15 px-6 py-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {editing ? "Amend entry" : "New entry"}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold">
                    {editing ? "Edit expense" : "Add expense"}
                  </h2>
                </div>
                <button
                  onClick={closeExpenseSheet}
                  aria-label="Close"
                  className="grid h-8 w-8 cursor-pointer place-items-center border border-ink/30 text-ink-soft transition hover:bg-ink/6 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* cheque-style amount line */}
                <motion.fieldset
                  animate={error ? { x: [0, -9, 9, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex items-end gap-2 border-b-2 pb-2 transition-colors duration-150",
                    error ? "border-negative" : "border-ink/50 focus-within:border-primary"
                  )}
                >
                  <span className="font-mono text-xl text-ink-faint">{sym}</span>
                  <input
                    ref={amountRef}
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value.replace(/[^0-9.]/g, "") }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-label="Amount"
                    className="tnum w-full bg-transparent font-mono text-3xl font-semibold tracking-tight outline-none placeholder:text-ink-faint/50"
                  />
                </motion.fieldset>
                {error && (
                  <p role="alert" className="mt-2 font-mono text-xs font-medium text-negative">
                    Enter an amount greater than zero.
                  </p>
                )}

                <p className="label-mono mb-2.5 mt-6">Category</p>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {CATEGORIES.map((c) => {
                    const active = form.categoryId === c.id;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setForm((f) => ({ ...f, categoryId: c.id }))}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-1.5 border px-1 pb-2 pt-2.5 font-mono text-[9px] uppercase leading-tight tracking-wide transition-all duration-150",
                          active
                            ? "border-ink bg-ink/5 text-ink"
                            : "border-ink/20 text-ink-soft hover:border-ink/50 hover:text-ink"
                        )}
                        style={active ? { boxShadow: `inset 0 -3px 0 0 ${c.color}` } : undefined}
                      >
                        <Icon className="h-[17px] w-[17px]" style={{ color: c.color }} />
                        <span className="text-center">{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="label-mono mb-2">Date</p>
                    <input
                      type="date"
                      value={form.date}
                      max={todayISO()}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="field"
                    />
                  </div>
                  <div>
                    <p className="label-mono mb-2">Paid with</p>
                    <div className="flex border border-rule-strong">
                      {PAYMENT_METHODS.map((m) => {
                        const active = form.method === m.id;
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setForm((f) => ({ ...f, method: m.id }))}
                            className={cn(
                              "flex flex-1 cursor-pointer items-center justify-center gap-1 py-2 font-mono text-[10px] uppercase tracking-wide transition-colors duration-150",
                              active
                                ? "bg-ink text-paper"
                                : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden min-[420px]:inline">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="label-mono mb-2 mt-6">Note</p>
                <input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  maxLength={80}
                  placeholder="e.g. Team lunch at the ramen place"
                  className="field"
                />
              </div>

              <div className="flex shrink-0 items-center gap-2.5 border-t border-dashed border-ink/35 px-6 py-4">
                {editing && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    aria-label="Delete expense"
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center border border-negative/50 text-negative transition hover:bg-negative/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button onClick={closeExpenseSheet} className="btn btn-ghost cursor-pointer px-5">
                  Cancel
                </button>
                <motion.button onClick={submit} whileTap={{ scale: 0.98 }} className="btn btn-primary flex-1 cursor-pointer">
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" /> Filed
                    </>
                  ) : editing ? (
                    "Save changes"
                  ) : (
                    "File expense"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete}
        title="Strike this entry?"
        body="It will be removed from the ledger and every total. This can't be undone."
        confirmLabel="Strike entry"
        onConfirm={() => {
          if (editingId) deleteExpense(editingId);
          closeExpenseSheet();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
