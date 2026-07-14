import { useMemo, useState } from "react";
import { BlogCard } from "./BlogCard";
import {
  allCategories,
  allTags,
  slugifyTopic,
  sortedBlogPosts,
} from "../lib/blogPosts";

/**
 * Client-side blog search + topic filter.
 * Filters across ALL posts in `sortedBlogPosts` — not just the current page.
 * When no filter is active, renders nothing (host page shows its normal grid).
 */
export function BlogFilterBar() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  const active = q.trim().length > 0 || category !== "" || tag !== "";

  const results = useMemo(() => {
    if (!active) return [];
    const needle = q.trim().toLowerCase();
    return sortedBlogPosts.filter((p) => {
      if (category && slugifyTopic(p.category) !== category) return false;
      if (tag && !(p.focusKeywords ?? []).some((k) => slugifyTopic(k) === tag))
        return false;
      if (!needle) return true;
      const hay = [
        p.title,
        p.subtitle,
        p.excerpt,
        p.category,
        ...(p.focusKeywords ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, category, tag, active]);

  return (
    <div className="mx-auto mb-10 max-w-7xl">
      <form
        role="search"
        aria-label="Search the Weddings.io blog"
        onSubmit={(e) => e.preventDefault()}
        className="rounded-lg border border-border bg-card p-4 shadow-sm md:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="block">
            <span className="sr-only">Search posts</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts by keyword…"
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All categories</option>
              {allCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label} ({c.count})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Filter by tag</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All tags</option>
              {allTags.slice(0, 80).map((t) => (
                <option key={t.slug} value={t.slug}>
                  #{t.label} ({t.count})
                </option>
              ))}
            </select>
          </label>
          {active && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("");
                setTag("");
              }}
              className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {active && (
        <section className="mt-8" aria-live="polite">
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
            {q && ` for “${q}”`}
          </p>
          {results.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-8 text-center text-muted-foreground">
              No matching posts. Try a different keyword or clear the filters.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
