import { useEffect, useState } from "react";
import { BUILD_COMMIT_FULL, BUILD_COMMIT_SHORT, BUILD_TIME_LABEL, LATEST_PRICING_CODE_VERSION } from "../lib/buildInfo";
import { PRICING_CODE_VERSION } from "../lib/territoryPricing";

interface RemoteBuildInfo {
  commitFull?: string;
  commitShort?: string;
  buildTimeLabel?: string;
  pricingCodeVersion?: string;
}

async function unregisterLegacyAppShellServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations
      .filter((registration) => {
        const scriptUrl = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL || "";
        return scriptUrl.endsWith("/service-worker.js");
      })
      .map((registration) => registration.unregister()),
  );
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.allSettled(
      cacheNames
        .filter((name) => name.startsWith("weddings-io-") || name.startsWith("wio-app-") || name.includes("precache"))
        .map((name) => caches.delete(name)),
    );
  }
}

export function PricingVersionBanner() {
  const [remote, setRemote] = useState<RemoteBuildInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    unregisterLegacyAppShellServiceWorker().catch(() => undefined);
    fetch(`/build-info.json?cb=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: RemoteBuildInfo | null) => {
        if (!cancelled && data) setRemote(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const localMismatch = PRICING_CODE_VERSION !== LATEST_PRICING_CODE_VERSION;
  const remoteCommitMismatch = Boolean(remote?.commitFull && remote.commitFull !== BUILD_COMMIT_FULL);
  const remotePricingMismatch = Boolean(remote?.pricingCodeVersion && remote.pricingCodeVersion !== PRICING_CODE_VERSION);

  if (!localMismatch && !remoteCommitMismatch && !remotePricingMismatch) return null;

  const latestCommit = remote?.commitShort || remote?.commitFull?.slice(0, 7) || BUILD_COMMIT_SHORT;
  const latestTime = remote?.buildTimeLabel || BUILD_TIME_LABEL;

  return (
    <div className="fixed inset-x-0 top-0 z-[90] border-b border-destructive/50 bg-destructive px-4 py-3 text-destructive-foreground shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
        <p className="font-semibold">
          Warning: this device is running stale pricing code. Loaded {BUILD_COMMIT_SHORT}; latest deploy {latestCommit} · {latestTime}.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex w-fit items-center justify-center rounded-md border border-destructive-foreground/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] hover:bg-destructive-foreground/10"
        >
          Reload latest
        </button>
      </div>
    </div>
  );
}