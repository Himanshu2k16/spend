import {
  CarFront,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  ReceiptText,
  Repeat,
  Shapes,
  ShoppingBag,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "food"
  | "groceries"
  | "transport"
  | "shopping"
  | "fun"
  | "bills"
  | "health"
  | "learning"
  | "travel"
  | "rent"
  | "subs"
  | "other";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  color: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "food", label: "Food & Drinks", color: "#bf4b23", icon: UtensilsCrossed },
  { id: "groceries", label: "Groceries", color: "#3e7c4f", icon: ShoppingBasket },
  { id: "transport", label: "Transport", color: "#33619e", icon: CarFront },
  { id: "shopping", label: "Shopping", color: "#8c4a76", icon: ShoppingBag },
  { id: "fun", label: "Entertainment", color: "#c99117", icon: Clapperboard },
  { id: "bills", label: "Bills & Utilities", color: "#54622f", icon: ReceiptText },
  { id: "health", label: "Health", color: "#2e7d74", icon: HeartPulse },
  { id: "learning", label: "Education", color: "#6e4b8e", icon: GraduationCap },
  { id: "travel", label: "Travel", color: "#2e8c8c", icon: Plane },
  { id: "rent", label: "Rent & Home", color: "#7a5230", icon: House },
  { id: "subs", label: "Subscriptions", color: "#b3554d", icon: Repeat },
  { id: "other", label: "Other", color: "#75705f", icon: Shapes },
];

const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategory(id: string): CategoryDef {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other;
}
