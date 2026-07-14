## New pricing rule

- Formula: `monthly = clamp( round10( basePrice(pop) × pppIndex(country) ), $10, $2,000 )`, where `basePrice = $10 per 100K population` and `pppIndex` is a country factor (World Bank PPP, US = 1.00).
- Applies to all three tracks: couples (free forever — PPP note is context only), vendors, and enterprise/planner.
- One exclusive planner slot per city (unchanged).
- Add-ons stay but are demoted to a separate, plainly-labeled "Optional extras" block outside the core price. No "buried fine print" language anywhere.

## Files to change

### Core formula
- `src/lib/territoryPricing.ts` — add `COUNTRY_PPP` map (24 countries you serve), add `pppPrice(city|{pop,country})`, add `SUPPORTED_CITIES` catalog (~30 cities across those countries with population + country code), keep `territoryPrice` as the raw pre-PPP base, add `MAX_MONTHLY_PRICE = 2000`. Retire the hardcoded 11-row `TERRITORY_MATRIX` in favor of a display helper that renders a compact "small / mid / large / mega city" example table computed from the formula.
- `src/lib/__tests__/territoryPricing.test.ts` — rewrite around PPP: assert `pppPrice(NYC) ≈ $830`, `pppPrice(Mumbai) ≈ $560` (20M × 0.28 PPP, rounded, clamped), `pppPrice(Aldergrove BC)` = $10 floor, `pppPrice(any) ≤ $2000` cap. Keep the "one slot per city" and add-on flat-price assertions.
- `src/lib/__tests__/plannerCalculator.test.ts` — align stale expectations with the new PPP calculator input (city dropdown, not free-text population).

### Homepage
- `src/routes/index.tsx`:
  - Replace the existing `PlannerPriceCalculator` (population text input) with a `CityPriceCalculator`: `<select>` of supported cities → shows monthly price, PPP factor used, "exclusive — 1 planner per city" badge, and a CTA to `/vendors/`.
  - Update the track-selector subcopy on the Vendors/Enterprise cards to reference the "$10–$2,000/mo, priced by your city" range instead of the old flat $10/yr.
  - Update the 6-item FAQ under the tracks: rewrite the two vendor Qs and two enterprise Qs around PPP pricing, add explicit "no tiers, no buried add-ons" line, keep couples free.
  - Update FAQPage JSON-LD to match the new FAQ answers.

### Pricing page
- `src/routes/pricing.tsx` — headline + hero copy from "$10 per 100K" to "$10–$2,000/mo, priced by city population × local PPP". Replace the 11-row bracket table with a compact "example cities" table generated from `pppPrice()`. Add a "How PPP affects your price" explainer block with three short paragraphs (Couples / Vendors / Enterprise). Move add-ons into a clearly-titled "Optional extras" section beneath the core price, each with a plain-language one-liner.

### Other routes referencing the rule
- `src/routes/seo.tsx`, `src/routes/directory.tsx`, `src/routes/planners.tsx` — replace any "$10 per 100K" or "39 brackets" phrasing with the PPP one-liner and link to `/pricing`.
- `src/routes/admin.verify.tsx` — update the pricing self-check assertion strings.
- `src/lib/blogPosts.ts` — update excerpts of the pricing-related posts (`transparent-territory-pricing`, `territory-pricing-how-it-works`, `wedding-planning-app-pricing-2026`) to a one-sentence PPP summary. Full blog post bodies under `public/blog/...` and other legacy static HTML (docs/, public/press, public/faq, public/legal, public/journal, public/planners.html) are left with a small editor's note pointing to `/pricing` — rewriting all of them is a separate content pass, not this turn.

### Analytics
- `src/lib/analytics.ts` — add a `pricing_calculator_city_selected` event with `{ city, country, ppp, monthly_usd }`. Fire from the new homepage calculator. Keep the existing `pricing_calculator_used` type for back-compat but stop emitting it.

### Memory & docs
- `mem://features/territory-matrix` and `mem://features/pricing` — rewrite around the PPP formula, $10–$2,000 range, all-three-tracks scope, add-ons as optional extras. Update `mem://index.md` Core rules to match.
- No changes to security memory (pricing isn't a security concern).

## PPP index (initial values, World Bank–derived, US = 1.00)

```text
US 1.00   CA 0.85   GB 0.72   AU 0.85   NZ 0.83
AE 0.55   SA 0.44   QA 0.55   KW 0.50
IN 0.28   PK 0.29   BD 0.32   LK 0.35   NP 0.32
SG 0.65   MY 0.42   TH 0.38   ID 0.34   PH 0.36
ZA 0.44   KE 0.36   NG 0.32
FR 0.78   DE 0.78   IT 0.72   ES 0.68
```

Editable in one constant so you can tune without a schema change.

## Out of scope for this turn

- Rewriting every historical blog post body under `public/blog/**/index.html`.
- Adding a new paid tier for couples (kept free per current model; PPP explanation only frames why prices differ regionally).
- Payment gateway wiring (still `<GatewayComingSoon />` on every CTA).