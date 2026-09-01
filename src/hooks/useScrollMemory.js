import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = {};

/**
 * Saves and restores window scroll position per pathname.
 * Call once in Layout or a parent that wraps all tab pages.
 */
export function useScrollMemory() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    const next = location.pathname;

    if (prev !== next) {
      // Save outgoing page scroll position
      scrollPositions[prev] = window.scrollY;
      prevPathRef.current = next;
    }

    // Restore or reset incoming page scroll position
    const saved = scrollPositions[next] ?? 0;
    // Use a short RAF so the new page content has painted
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: saved, behavior: "instant" });
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);
}