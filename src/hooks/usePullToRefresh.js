import { useState, useEffect, useRef } from "react";

/**
 * usePullToRefresh - fires `onRefresh` when the user pulls down past a threshold.
 * Works on touch devices; no-ops on desktop.
 * Returns { isRefreshing, pullDistance, containerRef }
 * Attach containerRef to the scrollable container (or document).
 */
export function usePullToRefresh({ onRefresh, threshold = 72 }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current || window;

    const getScrollTop = () => {
      if (el === window) return window.scrollY || document.documentElement.scrollTop;
      return el.scrollTop;
    };

    const onTouchStart = (e) => {
      if (getScrollTop() === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startYRef.current === null) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0 && getScrollTop() === 0) {
        setPullDistance(Math.min(delta * 0.4, threshold * 1.5));
        if (delta > 10) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (startYRef.current === null) return;
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
      startYRef.current = null;
    };

    const target = el === window ? document : el;
    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchmove", onTouchMove, { passive: false });
    target.addEventListener("touchend", onTouchEnd);

    return () => {
      target.removeEventListener("touchstart", onTouchStart);
      target.removeEventListener("touchmove", onTouchMove);
      target.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, threshold, isRefreshing, pullDistance]);

  return { isRefreshing, pullDistance };
}