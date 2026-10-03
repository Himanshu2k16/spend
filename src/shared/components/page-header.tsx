export function PageHeader({
  index,
  overline,
  title,
  subtitle,
  children,
}: {
  index: string;
  overline: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3 border-b-2 border-ink pb-2">
        <span className="font-mono text-xs font-semibold text-accent">{index}</span>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {overline}
        </p>
        <span className="ml-auto flex items-center gap-3">{children}</span>
      </div>
      <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-[42px]">
        {title}
      </h1>
      {subtitle ? <p className="mt-2 max-w-xl text-sm text-ink-soft">{subtitle}</p> : null}
    </header>
  );
}
