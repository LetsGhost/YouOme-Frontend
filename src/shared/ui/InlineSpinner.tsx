export function InlineSpinner({
  size = 16,
  strokeWidth = 2.4,
  color = "currentColor",
  className,
}: {
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      className={className ? `inline-spinner ${className}` : "inline-spinner"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      role="status"
      aria-label="Loading"
    >
      <path d="M12 3a9 9 0 100 18" opacity={0.9} />
    </svg>
  );
}

export function LoadingBlock({
  label,
  size = 22,
  minHeight,
}: {
  label?: string;
  size?: number;
  minHeight?: number | string;
}) {
  return (
    <div className="loading-block" style={minHeight !== undefined ? { minHeight } : undefined}>
      <InlineSpinner size={size} color="var(--color-muted)" />
      {label ? <span className="loading-block-label">{label}</span> : null}
    </div>
  );
}
