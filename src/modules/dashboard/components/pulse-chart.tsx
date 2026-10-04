"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Panel, PanelHeader } from "@/shared/components/panel";
import { EASE_OUT_EXPO } from "@/shared/lib/motion";
import { formatMoney } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { useExpensesStore } from "@/modules/expenses/store";
import { lastNDaysSeries } from "@/modules/expenses/utils/aggregate";
import { friendlyDate } from "@/shared/lib/dates";

const W = 720;
const H = 240;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 18;
const PAD_B = 30;

function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Ink-drawn 14-day pulse: solid ink line over a hatched fill, ledger grid. */
export function PulseChart({ className }: { className?: string }) {
  const expenses = useExpensesStore((s) => s.expenses);
  const currency = useExpensesStore((s) => s.currency);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const data = useMemo(() => lastNDaysSeries(expenses, 14), [expenses]);
  const total14 = data.reduce((s, d) => s + d.total, 0);

  const { linePath, areaPath, points, max } = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.total), 40);
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const pts = data.map((d, i) => ({
      x: PAD_L + (i / Math.max(1, data.length - 1)) * innerW,
      y: PAD_T + (1 - d.total / maxVal) * innerH,
    }));
    const line = smoothPath(pts);
    const area = line
      ? `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${H - PAD_B} L ${pts[0].x.toFixed(2)} ${H - PAD_B} Z`
      : "";
    return { linePath: line, areaPath: area, points: pts, max: maxVal };
  }, [data]);

  function onMove(e: React.MouseEvent) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((relX - PAD_L) / (W - PAD_L - PAD_R)) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const activePoint = active !== null ? points[active] : null;
  const activeData = active !== null ? data[active] : null;
  const lastPoint = points[points.length - 1];

  return (
    <Panel className={cn(className)}>
      <PanelHeader
        label="Spending pulse — last 14 days"
        right={
          <span className="tnum font-mono text-xs text-ink-soft">
            total <span className="font-semibold text-ink">{formatMoney(total14, currency)}</span>
          </span>
        }
      />

      <div
        ref={wrapRef}
        className="relative px-3 pb-3 pt-4 sm:px-5 sm:pb-4"
        onMouseMove={onMove}
        onMouseLeave={() => setActive(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Spending over the last 14 days"
        >
          <defs>
            <pattern
              id="pulse-hatch"
              width="6"
              height="6"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--hatch-ink)" strokeWidth="1" />
            </pattern>
          </defs>

          {[1 / 3, 2 / 3, 1].map((f) => {
            const y = PAD_T + (1 - f) * (H - PAD_T - PAD_B);
            return (
              <g key={f}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke="var(--chart-grid)"
                  strokeDasharray="1 5"
                />
                <text
                  x={PAD_L + 2}
                  y={y - 5}
                  fontSize="10"
                  fill="var(--color-ink-faint)"
                  fontFamily="var(--font-spline)"
                >
                  {formatMoney(max * f, currency, { compact: true })}
                </text>
              </g>
            );
          })}

          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#pulse-hatch)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: reduce ? 0 : 0.7 }}
            />
          )}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="1.75"
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
            />
          )}

          {activePoint && (
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={PAD_T - 6}
              y2={H - PAD_B}
              stroke="rgba(33,29,22,0.45)"
              strokeDasharray="2 4"
            />
          )}
          {activePoint && (
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="4.5"
              fill="var(--color-surface)"
              stroke="var(--color-ink)"
              strokeWidth="2"
            />
          )}

          {lastPoint && (
            <g>
              <motion.circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="4.5"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                animate={reduce ? undefined : { scale: [1, 2.4], opacity: [0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                className="animate-ping-soft"
              />
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="4"
                fill="var(--color-accent)"
                stroke="var(--color-surface)"
                strokeWidth="1.5"
              />
            </g>
          )}

          {data.map((d, i) =>
            i % 3 === 0 || i === data.length - 1 ? (
              <text
                key={d.iso}
                x={points[i].x}
                y={H - 8}
                fontSize="10"
                textAnchor="middle"
                fill={i === data.length - 1 ? "var(--color-accent)" : "var(--color-ink-faint)"}
                fontFamily="var(--font-spline)"
              >
                {d.iso.slice(8, 10)}
              </text>
            ) : null
          )}
        </svg>

        {activeData && activePoint && (
          <div
            className="pointer-events-none absolute z-10 border border-ink bg-surface px-3 py-2 text-center shadow-hard-sm"
            style={{
              left: `calc(${(activePoint.x / W) * 100}% )`,
              top: `${(activePoint.y / H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 14px))",
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
              {friendlyDate(activeData.iso)}
            </p>
            <p className="tnum font-mono text-sm font-semibold">
              {formatMoney(activeData.total, currency)}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
