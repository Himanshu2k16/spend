import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Rubber-stamp percentage change. `invert` treats a rise as bad (spending). */
export function DeltaChip({
  value,
  invert = false,
  suffix = "vs last month",
}: {
  value: number | null;
  invert?: boolean;
  suffix?: string;
}) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="label-mono">first tracked month</span>;
  }
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "stamp tnum",
        good ? "text-primary" : "text-negative"
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(Math.round(value))}%
      {suffix ? <span className="font-normal text-ink-faint">— {suffix}</span> : null}
    </span>
  );
}
