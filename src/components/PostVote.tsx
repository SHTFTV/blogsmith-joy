import { useEffect, useState } from "react";

type Period = "day" | "week" | "month" | "year";

const STORAGE_KEY = "wio.votes.v1";
const VOTED_KEY = "wio.voted.v1";

type VoteStore = Record<string, Record<Period, number>>;
type VotedStore = Record<string, Record<Period, boolean>>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getVotes(slug: string, period: Period): number {
  const store = readJSON<VoteStore>(STORAGE_KEY, {});
  return store[slug]?.[period] ?? 0;
}

export function getAllVotes(period: Period): Record<string, number> {
  const store = readJSON<VoteStore>(STORAGE_KEY, {});
  const out: Record<string, number> = {};
  for (const [slug, byPeriod] of Object.entries(store)) {
    out[slug] = byPeriod[period] ?? 0;
  }
  return out;
}

export function PostVote({ slug }: { slug: string }) {
  const [period, setPeriod] = useState<Period>("day");
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    setCount(getVotes(slug, period));
    const votedStore = readJSON<VotedStore>(VOTED_KEY, {});
    setVoted(Boolean(votedStore[slug]?.[period]));
  }, [slug, period]);

  const cast = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;
    const store = readJSON<VoteStore>(STORAGE_KEY, {});
    const byPeriod = store[slug] ?? { day: 0, week: 0, month: 0, year: 0 };
    byPeriod[period] = (byPeriod[period] ?? 0) + 1;
    store[slug] = byPeriod;
    writeJSON(STORAGE_KEY, store);

    const votedStore = readJSON<VotedStore>(VOTED_KEY, {});
    const slugVoted = votedStore[slug] ?? { day: false, week: false, month: false, year: false };
    slugVoted[period] = true;
    votedStore[slug] = slugVoted;
    writeJSON(VOTED_KEY, votedStore);

    setCount(byPeriod[period]);
    setVoted(true);
  };

  const periods: Period[] = ["day", "week", "month", "year"];

  return (
    <div
      className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex gap-1" role="tablist" aria-label="Voting period">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPeriod(p);
            }}
            className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={cast}
        disabled={voted}
        aria-label={voted ? `Voted — ${count} votes this ${period}` : `Vote for best post of the ${period}`}
        className={`flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-bold transition ${
          voted
            ? "cursor-default border-primary/40 bg-primary/10 text-primary"
            : "border-border text-foreground hover:border-primary hover:text-primary"
        }`}
      >
        <span aria-hidden>▲</span>
        <span>{count}</span>
        <span className="hidden sm:inline">{voted ? "Voted" : "Vote"}</span>
      </button>
    </div>
  );
}
