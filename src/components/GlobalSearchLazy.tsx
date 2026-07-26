"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

// GlobalSearch bundles projects.json + framer-motion + icons, yet is only ever
// opened via Ctrl+K or the navbar search button. Load it on first open intent
// instead of shipping it to every visitor on every page.
export default function GlobalSearchLazy() {
  const [Search, setSearch] = useState<ComponentType | null>(null);
  const pendingOpen = useRef(false);

  useEffect(() => {
    if (Search) return;

    const load = () => {
      pendingOpen.current = true;
      import("./GlobalSearch").then((mod) => setSearch(() => mod.default));
    };

    const onOpenEvent = () => load();
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        load();
      }
    };

    window.addEventListener("open-global-search", onOpenEvent);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("open-global-search", onOpenEvent);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [Search]);

  // Child effects run before this one, so GlobalSearch's own listener is
  // registered by the time we re-dispatch the open event it missed.
  useEffect(() => {
    if (Search && pendingOpen.current) {
      pendingOpen.current = false;
      window.dispatchEvent(new CustomEvent("open-global-search"));
    }
  }, [Search]);

  return Search ? <Search /> : null;
}
