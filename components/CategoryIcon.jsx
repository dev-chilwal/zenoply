// Keyed inline SVG icons for categories. Stroke-based, currentColor-driven,
// so they render identically across OS/browser (no emoji font dependence) and
// adapt to light/dark theme automatically.
const ICONS = {
  finance: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9a2.5 2.5 0 0 0-5 0c0 3 5 1.5 5 4.5a2.5 2.5 0 0 1-5 0" />
      <path d="M12 6.5v1M12 16v1" />
    </>
  ),
  pdf: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12.5h1a1.5 1.5 0 0 1 0 3h-1zM9.5 12.5v5" />
    </>
  ),
  text: (
    <>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h9" />
    </>
  ),
  dev: (
    <>
      <path d="M9 8l-4 4 4 4" />
      <path d="M15 8l4 4-4 4" />
    </>
  ),
  convert: (
    <>
      <path d="M4 9h13l-3-3" />
      <path d="M20 15H7l3 3" />
    </>
  ),
};

export default function CategoryIcon({ name, className = "cat-icon" }) {
  const glyph = ICONS[name] ?? ICONS.dev;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
