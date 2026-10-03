import { Banknote, CreditCard, Landmark, Smartphone, type LucideIcon } from "lucide-react";
import type { PaymentMethod } from "./types";

export const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; icon: LucideIcon }> = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "bank", label: "Bank", icon: Landmark },
];

const METHOD_MAP: Record<PaymentMethod, string> = {
  card: "Card",
  cash: "Cash",
  upi: "UPI",
  bank: "Bank transfer",
};

export function methodLabel(method: PaymentMethod): string {
  return METHOD_MAP[method] ?? method;
}
