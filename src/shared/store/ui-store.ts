import { create } from "zustand";

interface UIState {
  /** Selected month as yyyy-mm; null until the client mounts */
  month: string | null;
  expenseSheet: { open: boolean; editingId: string | null };
  setMonth: (month: string) => void;
  openExpenseSheet: (editingId?: string | null) => void;
  closeExpenseSheet: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  month: null,
  expenseSheet: { open: false, editingId: null },
  setMonth: (month) => set({ month }),
  openExpenseSheet: (editingId = null) => set({ expenseSheet: { open: true, editingId } }),
  closeExpenseSheet: () => set({ expenseSheet: { open: false, editingId: null } }),
}));
