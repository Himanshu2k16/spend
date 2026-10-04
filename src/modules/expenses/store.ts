import { create } from "zustand";
import type { CategoryId } from "@/modules/categories";
import type { CurrencyCode, RateTable } from "@/shared/lib/money";
import { api } from "@/shared/lib/api";
import type { Expense, ExpenseInput } from "./types";

export type BudgetMap = Partial<Record<CategoryId, number>>;

interface ExpensesState {
  expenses: Expense[];
  budgets: BudgetMap;
  overallBudget: number | null;
  currency: CurrencyCode;
  /** True once the ledger has been loaded from the backend for this session. */
  hasHydrated: boolean;
  loadFromServer: (data: {
    expenses: Expense[];
    budgets: BudgetMap;
    overallBudget: number | null;
    currency: CurrencyCode;
  }) => void;
  setHasHydrated: (v: boolean) => void;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, patch: Partial<ExpenseInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (categoryId: CategoryId, amount: number | null) => Promise<void>;
  setOverallBudget: (amount: number | null) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  /** Switch currency server-side: the backend re-denominates everything. */
  applyCurrency: (next: CurrencyCode) => Promise<RateTable | null>;
  loadDemoData: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const sorted = (list: Expense[]): Expense[] =>
  [...list].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt
  );

export const useExpensesStore = create<ExpensesState>()((set, get) => ({
  expenses: [],
  budgets: {},
  overallBudget: null,
  currency: "INR",
  hasHydrated: false,

  loadFromServer: (data) =>
    set({
      expenses: sorted(data.expenses),
      budgets: data.budgets,
      overallBudget: data.overallBudget,
      currency: data.currency,
      hasHydrated: true,
    }),

  setHasHydrated: (v) => set({ hasHydrated: v }),

  addExpense: async (input) => {
    const created = await api.post<Expense>("/api/expenses", input);
    set((s) => ({ expenses: sorted([created, ...s.expenses]) }));
  },

  updateExpense: async (id, patch) => {
    const updated = await api.put<Expense>(`/api/expenses/${id}`, patch);
    set((s) => ({
      expenses: sorted(s.expenses.map((e) => (e.id === id ? updated : e))),
    }));
  },

  deleteExpense: async (id) => {
    await api.delete(`/api/expenses/${id}`);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  setBudget: async (categoryId, amount) => {
    const next: BudgetMap = { ...get().budgets };
    if (amount === null || !Number.isFinite(amount) || amount <= 0) delete next[categoryId];
    else next[categoryId] = amount;
    const data = await api.put<{ budgets: BudgetMap; overallBudget: number | null }>(
      "/api/settings/budgets",
      { budgets: next }
    );
    set({ budgets: data.budgets, overallBudget: data.overallBudget });
  },

  setOverallBudget: async (amount) => {
    const data = await api.put<{ budgets: BudgetMap; overallBudget: number | null }>(
      "/api/settings/budgets",
      { overallBudget: amount }
    );
    set({ budgets: data.budgets, overallBudget: data.overallBudget });
  },

  setCurrency: async (currency) => {
    await api.put("/api/settings/preferences", { currency });
    set({ currency });
  },

  applyCurrency: async (next) => {
    const data = await api.post<{
      currency: CurrencyCode;
      expenses: Expense[];
      budgets: BudgetMap;
      overallBudget: number | null;
      rates: RateTable;
    }>("/api/settings/currency", { currency: next });
    set({
      currency: data.currency,
      expenses: sorted(data.expenses),
      budgets: data.budgets,
      overallBudget: data.overallBudget,
    });
    return data.rates;
  },

  loadDemoData: async () => {
    const expenses = await api.post<Expense[]>("/api/expenses/demo");
    set({ expenses: sorted(expenses) });
  },

  clearAll: async () => {
    await api.delete("/api/expenses");
    set({ expenses: [], budgets: {}, overallBudget: null });
  },
}));

/** Overall monthly budget: explicit value, or the sum of category envelopes. */
export function totalOverallBudget(s: { budgets: BudgetMap; overallBudget: number | null }): number {
  if (s.overallBudget != null) return s.overallBudget;
  return Object.values(s.budgets).reduce<number>((acc, v) => acc + (v ?? 0), 0);
}
