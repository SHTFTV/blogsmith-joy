# End-to-end tests (Playwright)

Two suites, run against the local Vite dev server on `:8080`:

- **`culture-a11y.spec.ts`** — axe-core WCAG 2.1 AA sweep on `/`, `/cultures/`,
  `/tools/`. Fails on ARIA, color-contrast, heading-order, or landmark
  violations. Also asserts the "Hispanic Heritage" label is present with
  accessible names on the card heading, CTA, and footer link, and that
  `/tools/mexican/` + `/tools/traditional/` still return < 400.

- **`culture-visual.spec.ts`** — Playwright screenshot diffs of the
  Hispanic Heritage culture card, rotating headline, and footer across
  **desktop (1440×900)**, **tablet (834×1112)**, and **mobile (iPhone 13)**.
  Animations are disabled before capture so runs are deterministic.

## Run

```bash
bunx playwright install chromium   # first time only
bunx playwright test               # runs all suites × 3 breakpoints
bunx playwright test --update-snapshots   # regenerate baselines after intentional UI changes
```

## Vitest vs Playwright

`vitest` still runs the pure-JS unit tests (`bun run test`). Playwright is
separate so unit runs stay fast and don't require a browser.
