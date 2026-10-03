import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CategoryId } from "@/modules/categories";
import type { CurrencyCode } from "@/shared/lib/money";
import { convert, type RateTable } from "@/shared/lib/rates";
import type { Expense, ExpenseInput } from "./types";
import { generateDemoExpenses } from "./utils/demo";

export type BudgetMap = Partial<Record<CategoryId, number>>;

interface ExpensesState {
  expenses: Expense[];
  budgets: BudgetMap;
  overallBudget: number | null;
  currency: CurrencyCode;
  seeded: boolean;
  hasHydrated: boolean;
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, patch: Partial<ExpenseInput>) => void;
  deleteExpense: (id: string) => void;
  setBudget: (categoryId: CategoryId, amount: number | null) => void;
  setOverallBudget: (amount: number | null) => void;
  setCurrency: (currency: CurrencyCode) => void;
  /** Switch display currency and re-denominate every stored amount via rates. */
  applyCurrency: (next: CurrencyCode, table: RateTable) => void;
  loadDemoData: () => void;
  clearAll: () => void;
  setHasHydrated: (v: boolean) => void;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set) => ({
      expenses: [],
      budgets: {},
      overallBudget: null,
      currency: "INR",
      seeded: false,
      hasHydrated: false,

      addExpense: (input) =>
        set((s) => ({
          expenses: [{ ...input, id: newId(), createdAt: Date.now() }, ...s.expenses],
        })),

      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      setBudget: (categoryId, amount) =>
        set((s) => {
          const next: BudgetMap = { ...s.budgets };
          if (amount === null || !Number.isFinite(amount) || amount <= 0) delete next[categoryId];
          else next[categoryId] = amount;
          return { budgets: next };
        }),

      setOverallBudget: (amount) =>
        set({ overallBudget: amount !== null && Number.isFinite(amount) && amount > 0 ? amount : null }),

      setCurrency: (currency) => set({ currency }),

      applyCurrency: (next, table) =>
        set((s) => {
          if (next === s.currency) return s;
          const cv = (amount: number) =>
            Math.round(convert(amount, s.currency, next, table) * 100) / 100;
          return {
            currency: next,
            expenses: s.expenses.map((e) => ({ ...e, amount: cv(e.amount) })),
            budgets: Object.fromEntries(
              Object.entries(s.budgets).map(([k, v]) => [k, v != null ? cv(v) : v])
            ) as BudgetMap,
            overallBudget: s.overallBudget != null ? cv(s.overallBudget) : null,
          };
        }),

      loadDemoData: () => set({ expenses: generateDemoExpenses(), seeded: true }),

      clearAll: () =>
        set({ expenses: [], budgets: {}, overallBudget: null, seeded: true }),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "spend.store.v1",
      version: 2,
      // v2: default currency moved to INR — start fresh rather than
      // misreading amounts that were recorded under the old currency.
      migrate: () => {
        const fresh: Pick<
          ExpensesState,
          "expenses" | "budgets" | "overallBudget" | "currency" | "seeded"
        > = {
          expenses: [],
          budgets: {},
          overallBudget: null,
          currency: "INR",
          seeded: false,
        };
        return fresh;
      },
      skipHydration: true,
      partialize: (s) => ({
        expenses: s.expenses,
        budgets: s.budgets,
        overallBudget: s.overallBudget,
        currency: s.currency,
        seeded: s.seeded,
      }),
    }
  )
);

/** Overall monthly budget: explicit value, or the sum of category envelopes. */
export function totalOverallBudget(s: { budgets: BudgetMap; overallBudget: number | null }): number {
  if (s.overallBudget != null) return s.overallBudget;
  return Object.values(s.budgets).reduce<number>((acc, v) => acc + (v ?? 0), 0);
}
