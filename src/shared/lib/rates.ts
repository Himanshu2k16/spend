/**
 * Exchange rates via open.er-api.com — free, no API key, ~160 currencies,
 * updated daily, CORS-enabled. The full supported currency list is derived
 * from the same response. Cached in localStorage for 12h; an approximate
 * offline table keeps conversion working without a network.
 */

import { POPULAR_CURRENCIES } from "./money";

const API = "https://open.er-api.com/v6/latest";

/** Approximate USD-based fallback rates (offline / fetch failure). */
const USD_FALLBACK: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 88,
  AED: 3.67,
  JPY: 152,
};

export interface RateTable {
  /** How many units of X one USD buys. */
  usdTo: Record<string, number>;
  /** Every currency code the API supports. */
  codes: string[];
  fetchedAt: number;
  live: boolean;
}

const CACHE_KEY = "spend.rates.v2";
const TTL = 12 * 60 * 60 * 1000;

export async function getUsdRates(): Promise<RateTable> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as RateTable;
        if (cached?.usdTo && cached?.codes?.length && Date.now() - cached.fetchedAt < TTL) {
          return cached;
        }
      }
    } catch {
      // ignore malformed cache
    }
  }

  try {
    const res = await fetch(`${API}/USD`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { rates?: Record<string, number> };
    if (!json.rates) throw new Error("no rates in response");

    const usdTo: Record<string, number> = {};
    const codes: string[] = [];
    for (const [code, rate] of Object.entries(json.rates)) {
      if (!/^[A-Z]{3}$/.test(code) || typeof rate !== "number" || rate <= 0) continue;
      usdTo[code] = rate;
      codes.push(code);
    }
    if (codes.length === 0) throw new Error("empty rate table");

    codes.sort();
    const table: RateTable = { usdTo, codes, fetchedAt: Date.now(), live: true };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(table));
    } catch {
      // storage unavailable — rates still usable in memory
    }
    return table;
  } catch {
    return {
      usdTo: { ...USD_FALLBACK },
      codes: [...POPULAR_CURRENCIES].sort(),
      fetchedAt: Date.now(),
      live: false,
    };
  }
}

/** Convert an amount between currencies using a USD-based rate table. */
export function convert(amount: number, from: string, to: string, table: RateTable): number {
  if (from === to) return amount;
  const fromRate = table.usdTo[from];
  const toRate = table.usdTo[to];
  // Unknown codes can't be converted honestly — leave the amount untouched.
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}
