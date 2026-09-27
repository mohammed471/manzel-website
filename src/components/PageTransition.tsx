"use client";

import { usePathname } from "next/navigation";

// Fade-in on every page change. CSS (`.page-fade` in globals.css), not framer-motion:
// the old motion.div shipped `opacity:0` in the server HTML, so no page content
// appeared until JavaScript had loaded (~5s LCP on a slow phone). The key remounts
// the wrapper on client navigation, which replays the animation.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
