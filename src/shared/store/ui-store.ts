import { create } from "zustand";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

interface UIState {
  /** Selected month as yyyy-mm; null until the client mounts */
  month: string | null;
  expenseSheet: { open: boolean; editingId: string | null };
  theme: Theme;
  setMonth: (month: string) => void;
  openExpenseSheet: (editingId?: string | null) => void;
  closeExpenseSheet: () => void;
  toggleTheme: () => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("spend.theme", theme);
  } catch {
    // private mode — theme just won't persist
  }
}

export const useUIStore = create<UIState>()((set, get) => ({
  month: null,
  expenseSheet: { open: false, editingId: null },
  theme: currentTheme(),
  setMonth: (month) => set({ month }),
  openExpenseSheet: (editingId = null) => set({ expenseSheet: { open: true, editingId } }),
  closeExpenseSheet: () => set({ expenseSheet: { open: false, editingId: null } }),
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyThemeClass(next);
    set({ theme: next });
  },
}));
