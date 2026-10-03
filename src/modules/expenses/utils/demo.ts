import type { CategoryId } from "@/modules/categories";
import type { Expense, ExpenseInput, PaymentMethod } from "../types";
import { daysInMonthKey, isoOf, todayISO, toISODate } from "@/shared/lib/dates";

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOTES: Record<CategoryId, string[]> = {
  food: [
    "Morning coffee", "Team lunch", "Ramen bowl", "Bakery run", "Boba tea",
    "Pizza night", "Sushi dinner", "Food truck tacos",
  ],
  groceries: ["Weekly groceries", "Fresh produce", "Corner store", "Farmers market", "Pantry restock"],
  transport: ["Metro top-up", "Ride share", "Fuel", "Parking", "Bus fare", "Airport taxi"],
  shopping: ["Sneakers", "Winter jacket", "Headphone case", "Desk lamp", "Gift for Maya", "Phone case"],
  fun: ["Cinema tickets", "Concert night", "Board game café", "Museum pass", "Bowling with friends"],
  bills: ["Electricity bill", "Water bill", "Internet", "Phone plan", "Gas bill"],
  health: ["Pharmacy run", "Dentist visit", "Gym membership", "Vitamins", "Physio session"],
  learning: ["Online course", "Design book", "Workshop ticket", "UI kit purchase"],
  travel: ["Weekend flight", "Hotel booking", "Train tickets", "Airbnb escape"],
  rent: ["Monthly rent", "Building maintenance"],
  subs: ["Netflix", "Spotify", "iCloud storage", "Figma Pro", "News subscription"],
  other: ["Haircut", "Laundry", "Donation", "Misc supplies"],
};

interface Spec {
  categoryId: CategoryId;
  perMonth: number;
  min: number;
  max: number;
  methods: PaymentMethod[];
  fixedDay?: number;
  fixedAmount?: number;
}

const SPECS: Spec[] = [
  { categoryId: "rent", perMonth: 1, min: 1440, max: 1440, methods: ["bank"], fixedDay: 1, fixedAmount: 1440 },
  { categoryId: "groceries", perMonth: 5, min: 45, max: 130, methods: ["card", "upi"] },
  { categoryId: "food", perMonth: 9, min: 6, max: 38, methods: ["card", "cash", "upi"] },
  { categoryId: "transport", perMonth: 7, min: 3, max: 28, methods: ["upi", "card"] },
  { categoryId: "subs", perMonth: 3, min: 9.99, max: 17.99, methods: ["card"] },
  { categoryId: "bills", perMonth: 2, min: 45, max: 130, methods: ["bank", "card"] },
  { categoryId: "shopping", perMonth: 2, min: 24, max: 160, methods: ["card"] },
  { categoryId: "fun", perMonth: 3, min: 12, max: 55, methods: ["card", "cash"] },
  { categoryId: "health", perMonth: 1, min: 18, max: 90, methods: ["card", "cash"] },
  { categoryId: "learning", perMonth: 1, min: 15, max: 70, methods: ["card"] },
  { categoryId: "travel", perMonth: 0.45, min: 180, max: 420, methods: ["card"] },
];

/** Realistic, deterministic sample history covering the last ~3 months. */
export function generateDemoExpenses(now = new Date()): Expense[] {
  const rand = mulberry32(20261003);
  const todayIso = toISODate(now);
  const currentKey = todayIso.slice(0, 7);
  const maxDayCurrent = now.getDate();

  const inputs: ExpenseInput[] = [];

  for (let back = 2; back >= 0; back--) {
    const [y, m] = currentKey.split("-").map(Number);
    const anchor = new Date(y, m - 1 - back, 1);
    const key = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}`;
    const dim = daysInMonthKey(key);
    const maxDay = back === 0 ? maxDayCurrent : dim;

    for (const spec of SPECS) {
      const count = Math.round(spec.perMonth * (0.8 + rand() * 0.5));
      for (let i = 0; i < count; i++) {
        const day = spec.fixedDay ?? 1 + Math.floor(rand() * dim);
        if (day > maxDay) continue;
        const raw = spec.fixedAmount ?? spec.min + rand() * (spec.max - spec.min);
        const amount = Math.round(raw * 100) / 100;
        if (amount <= 0) continue;
        const notes = NOTES[spec.categoryId];
        inputs.push({
          amount,
          categoryId: spec.categoryId,
          date: isoOf(key, day),
          note: notes[Math.floor(rand() * notes.length)] ?? "",
          method: spec.methods[Math.floor(rand() * spec.methods.length)] ?? "card",
        });
      }
    }
  }

  return inputs
    .map((input, i) => ({
      ...input,
      id: `demo-${todayISO()}-${i}`,
      createdAt: new Date(`${input.date}T09:00:00`).getTime() + i,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
}
