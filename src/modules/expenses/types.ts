import type { CategoryId } from "@/modules/categories";
import type { CurrencyCode } from "@/shared/lib/money";

export type PaymentMethod = "card" | "cash" | "upi" | "bank";

export interface Expense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  /** ISO date, yyyy-mm-dd */
  date: string;
  note: string;
  method: PaymentMethod;
  createdAt: number;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

export type { CurrencyCode };
