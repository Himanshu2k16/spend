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
  { id: "food", label: "Food & Drinks", color: "#c85a2f", icon: UtensilsCrossed },
  { id: "groceries", label: "Groceries", color: "#4d9161", icon: ShoppingBasket },
  { id: "transport", label: "Transport", color: "#4a7ab8", icon: CarFront },
  { id: "shopping", label: "Shopping", color: "#a05e8b", icon: ShoppingBag },
  { id: "fun", label: "Entertainment", color: "#d3a02c", icon: Clapperboard },
  { id: "bills", label: "Bills & Utilities", color: "#71833c", icon: ReceiptText },
  { id: "health", label: "Health", color: "#3d968c", icon: HeartPulse },
  { id: "learning", label: "Education", color: "#8a6cb5", icon: GraduationCap },
  { id: "travel", label: "Travel", color: "#3d9c9c", icon: Plane },
  { id: "rent", label: "Rent & Home", color: "#9a6b42", icon: House },
  { id: "subs", label: "Subscriptions", color: "#c06055", icon: Repeat },
  { id: "other", label: "Other", color: "#8b8578", icon: Shapes },
];

const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategory(id: string): CategoryDef {
  return CATEGORY_MAP[id] ?? CATEGORY_MAP.other;
}
