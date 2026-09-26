import type { ProductColor } from "@/lib/api";
import { cn } from "@/lib/utils";

// Compact swatch row for product cards. Unavailable colours are dimmed and
// struck through, so availability is never conveyed by colour alone.
export default function ColorDots({
  colors,
  max = 5,
  unavailableLabel,
  className,
}: {
  colors: ProductColor[];
  max?: number;
  unavailableLabel: string;
  className?: string;
}) {
  if (colors.length === 0) return null;
  const shown = colors.slice(0, max);
  const extra = colors.length - shown.length;

  return (
    <ul className={cn("flex items-center gap-1.5", className)}>
      {shown.map((c) => (
        <li key={c.id} className="relative">
          <span
            title={c.available ? c.name : `${c.name} — ${unavailableLabel}`}
            className={cn(
              "block w-4 h-4 rounded-full ring-1 ring-inset ring-black/15",
              !c.available && "opacity-40",
            )}
            style={{ backgroundColor: c.hex }}
          />
          {!c.available && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-auto h-px w-5 -rotate-45 bg-text-primary/70"
            />
          )}
          <span className="sr-only">{c.available ? c.name : `${c.name} — ${unavailableLabel}`}</span>
        </li>
      ))}
      {extra > 0 && <li className="text-xs font-medium text-text-secondary tabular-nums">+{extra}</li>}
    </ul>
  );
}
