/** Any ISO-4217 code the rates API supports — the settings dropdown offers all of them. */
export type CurrencyCode = string;

/** Quick-pick codes used for offline fallback rates. */
export const POPULAR_CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "INR", "AED", "JPY"];

/** Exchange-rate snapshot returned by the backend's currency switch. */
export interface RateTable {
  usdTo: Record<string, number>;
  fetchedAt: number;
  live: boolean;
}

export function currencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat("en", { style: "currency", currency: code }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

export function currencyName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function localeFor(code: string): string {
  return code === "INR" ? "en-IN" : "en-US";
}

export function formatMoney(
  amount: number,
  currency: string,
  opts?: { decimals?: boolean; compact?: boolean }
): string {
  const { decimals = true, compact = false } = opts ?? {};
  const frac = currency === "JPY" ? 0 : decimals && !compact ? 2 : 0;
  try {
    return new Intl.NumberFormat(localeFor(currency), {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: compact ? 0 : frac,
      maximumFractionDigits: compact ? (Math.abs(amount) >= 1000 ? 1 : 0) : frac,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(frac)}`;
  }
}
