import { RefreshCw } from "lucide-react";

export default function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 72 }) {
  const ready = pullDistance >= threshold;
  const visible = pullDistance > 0 || isRefreshing;

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center pointer-events-none"
      style={{ height: isRefreshing ? 48 : pullDistance, transition: isRefreshing ? "height 0.2s ease" : "none" }}
    >
      <div
        className={`rounded-full bg-card border border-border shadow-md p-2 flex items-center justify-center transition-transform duration-150 ${ready ? "scale-110" : "scale-100"}`}
        style={{ opacity: Math.min(pullDistance / threshold, 1) }}
      >
        <RefreshCw
          className={`h-4 w-4 text-primary ${isRefreshing ? "animate-spin" : ""}`}
          style={!isRefreshing ? { transform: `rotate(${(pullDistance / threshold) * 360}deg)` } : {}}
        />
      </div>
    </div>
  );
}