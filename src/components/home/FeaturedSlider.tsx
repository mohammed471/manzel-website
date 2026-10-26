import { Children, Fragment, type CSSProperties, type ReactNode } from "react";

const SECONDS_PER_CARD = 6;

// Featured projects drift sideways on their own, without stopping (owner's request 2026-10-26 — it
// moved one card every 5 s). Pure CSS, so it runs before any JavaScript: the row is drawn twice and
// slides by exactly one copy, so the loop never jumps. The copy is aria-hidden + inert. It pauses
// under the pointer / keyboard focus; under prefers-reduced-motion it is a plain swipeable row.
export default function FeaturedSlider({ children }: { children: ReactNode }) {
  const count = Children.count(children);
  const list = "flex shrink-0 [&>li]:pe-4";
  if (count < 2) return <ul className={list}>{children}</ul>;

  // Each copy must be wider than the screen, or a gap shows before the loop restarts.
  const reps = Math.ceil(4 / count);
  const cards = Array.from({ length: reps }, (_, i) => <Fragment key={i}>{children}</Fragment>);

  return (
    <div className="overflow-x-clip motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:[scrollbar-width:none]">
      <div
        className="featured-marquee flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${count * reps * SECONDS_PER_CARD}s` } as CSSProperties}
      >
        <ul className={list}>{cards}</ul>
        <ul className={`${list} motion-reduce:hidden`} aria-hidden inert>{cards}</ul>
      </div>
    </div>
  );
}
