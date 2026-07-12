import { useEffect, useState } from "react";
import { BUILD_COMMIT_SHORT, BUILD_TIME_LABEL } from "../lib/buildInfo";

/**
 * Small floating build/deployment badge so any visitor (including incognito)
 * can visually confirm they're viewing the latest publish. Click to open the
 * admin verification page.
 */
export function BuildBadge() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <a
      href="/admin/verify"
      title={`Deployed ${BUILD_TIME_LABEL} · commit ${BUILD_COMMIT_SHORT}`}
      className="fixed bottom-3 left-3 z-[60] rounded-full border border-border bg-background/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground shadow-lg backdrop-blur-md hover:border-primary hover:text-primary"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      build {BUILD_COMMIT_SHORT} · {BUILD_TIME_LABEL}
    </a>
  );
}
