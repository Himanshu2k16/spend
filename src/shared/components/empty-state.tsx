import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="mb-1 grid h-14 w-14 place-items-center border border-dashed border-ink/40 bg-paper">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}
