export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Spend logo">
      <rect x="3" y="3" width="58" height="58" fill="#faf7ec" stroke="#211d16" strokeWidth="4" />
      <path
        d="M14 37h8l5-13 8 21 5-14 4 6h6"
        fill="none"
        stroke="#1e5b43"
        strokeWidth="5"
        strokeLinecap="square"
      />
    </svg>
  );
}
