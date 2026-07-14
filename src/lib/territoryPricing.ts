import { BUILD_COMMIT_FULL } from "./buildInfo";

// WEDDINGS.IO PPP TERRITORY PRICING
// One exclusive planner slot per city, priced by local population × country PPP index.
// Formula: monthly = clamp( round10( basePrice(pop) × pppIndex(country) ), $10, $2,000 )
//   basePrice(pop) = floor(pop / 100,000) × $10, min $10
// No tiers. No add-ons buried in fine print. Add-ons live in ADDON_PRICING as clearly-
// labeled optional extras outside the core price.

export const PRICING_CODE_VERSION = BUILD_COMMIT_FULL;
export const PRICE_PER_100K = 10;
export const MIN_MONTHLY_PRICE = 10;
export const MAX_MONTHLY_PRICE = 2_000;
export const BRACKET_STEP = 100_000;
export const SLOTS_PER_CITY = 1;
export const VENDOR_ANNUAL_FEE = 10;

// Country PPP index (World Bank–derived, US = 1.00). Editable in one place.
export const COUNTRY_PPP: Readonly<Record<string, number>> = {
  US: 1.0,
  CA: 0.85,
  GB: 0.72,
  AU: 0.85,
  NZ: 0.83,
  AE: 0.55,
  SA: 0.44,
  QA: 0.55,
  KW: 0.5,
  IN: 0.28,
  PK: 0.29,
  BD: 0.32,
  LK: 0.35,
  NP: 0.32,
  SG: 0.65,
  MY: 0.42,
  TH: 0.38,
  ID: 0.34,
  PH: 0.36,
  ZA: 0.44,
  KE: 0.36,
  NG: 0.32,
  FR: 0.78,
  DE: 0.78,
  IT: 0.72,
  ES: 0.68,
};

export function pppIndex(country: string): number {
  return COUNTRY_PPP[country.toUpperCase()] ?? 1.0;
}

// Raw pre-PPP base — $10 per 100K population, $10 floor. Exposed for tests + callers
// that need the "US-equivalent" number.
export function territoryPrice(population: number): number {
  const safe = Number.isFinite(population) ? Math.max(0, population) : 0;
  return Math.max(MIN_MONTHLY_PRICE, Math.floor(safe / BRACKET_STEP) * PRICE_PER_100K);
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

// Final PPP-adjusted monthly price for a city, clamped to $10–$2,000.
export function pppPrice(population: number, country: string): number {
  const base = territoryPrice(population);
  const scaled = round10(base * pppIndex(country));
  return Math.min(MAX_MONTHLY_PRICE, Math.max(MIN_MONTHLY_PRICE, scaled));
}

export interface SupportedCity {
  city: string;
  country: string; // ISO-2
  countryName: string;
  population: number;
  populationLabel: string;
}

// Representative catalog covering the 24 countries we serve. Used by the homepage
// city calculator + pricing page examples. Extend freely.
export const SUPPORTED_CITIES: readonly SupportedCity[] = [
  { city: "Aldergrove, BC", country: "CA", countryName: "Canada", population: 50_000, populationLabel: "50K" },
  { city: "Langley, BC", country: "CA", countryName: "Canada", population: 180_000, populationLabel: "180K" },
  { city: "Vancouver, BC", country: "CA", countryName: "Canada", population: 675_000, populationLabel: "675K" },
  { city: "Toronto, ON", country: "CA", countryName: "Canada", population: 2_900_000, populationLabel: "2.9M" },
  { city: "New York, NY", country: "US", countryName: "United States", population: 8_300_000, populationLabel: "8.3M" },
  { city: "Los Angeles, CA", country: "US", countryName: "United States", population: 3_900_000, populationLabel: "3.9M" },
  { city: "Houston, TX", country: "US", countryName: "United States", population: 2_300_000, populationLabel: "2.3M" },
  { city: "London", country: "GB", countryName: "United Kingdom", population: 9_000_000, populationLabel: "9M" },
  { city: "Manchester", country: "GB", countryName: "United Kingdom", population: 550_000, populationLabel: "550K" },
  { city: "Sydney", country: "AU", countryName: "Australia", population: 5_300_000, populationLabel: "5.3M" },
  { city: "Auckland", country: "NZ", countryName: "New Zealand", population: 1_700_000, populationLabel: "1.7M" },
  { city: "Dubai", country: "AE", countryName: "United Arab Emirates", population: 3_500_000, populationLabel: "3.5M" },
  { city: "Riyadh", country: "SA", countryName: "Saudi Arabia", population: 7_600_000, populationLabel: "7.6M" },
  { city: "Doha", country: "QA", countryName: "Qatar", population: 2_400_000, populationLabel: "2.4M" },
  { city: "Kuwait City", country: "KW", countryName: "Kuwait", population: 3_100_000, populationLabel: "3.1M" },
  { city: "Mumbai", country: "IN", countryName: "India", population: 20_000_000, populationLabel: "20M" },
  { city: "Delhi", country: "IN", countryName: "India", population: 32_000_000, populationLabel: "32M" },
  { city: "Bengaluru", country: "IN", countryName: "India", population: 13_000_000, populationLabel: "13M" },
  { city: "Karachi", country: "PK", countryName: "Pakistan", population: 16_000_000, populationLabel: "16M" },
  { city: "Lahore", country: "PK", countryName: "Pakistan", population: 13_000_000, populationLabel: "13M" },
  { city: "Dhaka", country: "BD", countryName: "Bangladesh", population: 22_000_000, populationLabel: "22M" },
  { city: "Colombo", country: "LK", countryName: "Sri Lanka", population: 750_000, populationLabel: "750K" },
  { city: "Kathmandu", country: "NP", countryName: "Nepal", population: 1_400_000, populationLabel: "1.4M" },
  { city: "Singapore", country: "SG", countryName: "Singapore", population: 5_900_000, populationLabel: "5.9M" },
  { city: "Kuala Lumpur", country: "MY", countryName: "Malaysia", population: 1_800_000, populationLabel: "1.8M" },
  { city: "Bangkok", country: "TH", countryName: "Thailand", population: 10_500_000, populationLabel: "10.5M" },
  { city: "Jakarta", country: "ID", countryName: "Indonesia", population: 10_600_000, populationLabel: "10.6M" },
  { city: "Manila", country: "PH", countryName: "Philippines", population: 13_500_000, populationLabel: "13.5M" },
  { city: "Johannesburg", country: "ZA", countryName: "South Africa", population: 5_600_000, populationLabel: "5.6M" },
  { city: "Nairobi", country: "KE", countryName: "Kenya", population: 4_400_000, populationLabel: "4.4M" },
  { city: "Lagos", country: "NG", countryName: "Nigeria", population: 15_400_000, populationLabel: "15.4M" },
  { city: "Paris", country: "FR", countryName: "France", population: 2_100_000, populationLabel: "2.1M" },
  { city: "Berlin", country: "DE", countryName: "Germany", population: 3_700_000, populationLabel: "3.7M" },
  { city: "Rome", country: "IT", countryName: "Italy", population: 2_800_000, populationLabel: "2.8M" },
  { city: "Madrid", country: "ES", countryName: "Spain", population: 3_300_000, populationLabel: "3.3M" },
];

export function priceForCity(city: SupportedCity): number {
  return pppPrice(city.population, city.country);
}

// Compact 4-row display band used on the pricing page / homepage summaries.
export interface PricingBand {
  label: string;
  populationRange: string;
  usdRange: string;
  example: string;
}

export const PRICING_BANDS: readonly PricingBand[] = [
  { label: "Small city", populationRange: "Up to ~200K", usdRange: "$10 – $20/mo", example: "Aldergrove BC · Colombo LK" },
  { label: "Mid city", populationRange: "200K – 1M", usdRange: "$20 – $100/mo", example: "Langley BC · Manchester UK" },
  { label: "Large city", populationRange: "1M – 5M", usdRange: "$100 – $500/mo", example: "Toronto · Paris · Dubai" },
  { label: "Mega city", populationRange: "5M+", usdRange: "$500 – $2,000/mo (capped)", example: "New York · London · Mumbai" },
];

export const ADDON_PRICING = {
  creatorOutstandingBusinessMonthlyBase: 10,
  backlinkPackOneTime: 25,
  talcTvVisualBlastPerPost: 10,
  hallVisualizerPerRender: 2,
  guestPostAcceptedPost: 10,
} as const;

export function isSoldOut(activeSlots: number): boolean {
  return activeSlots >= SLOTS_PER_CITY;
}

export function territorySlots(_population: number): number {
  return SLOTS_PER_CITY;
}

export function formatUsdMonthly(n: number): string {
  return `$${n.toLocaleString("en-US")}/mo`;
}

// ─────────────────────────────────────────────────────────────
// Legacy compatibility shims — old routes/tests still import these.
// They now compute from the PPP formula (US baseline for territoryPrice).
// ─────────────────────────────────────────────────────────────

export interface TerritoryBracket {
  lowerBound: number;
  upperBound: number | null;
  totalAvailableSlots: number;
  monthlyPricePerSlot: number;
  territoryStatus: string;
}

export const TERRITORY_MATRIX: readonly TerritoryBracket[] = PRICING_BANDS.map((b, i) => ({
  lowerBound: i * 200_000,
  upperBound: i === PRICING_BANDS.length - 1 ? null : (i + 1) * 200_000 - 1,
  totalAvailableSlots: 1,
  monthlyPricePerSlot: MIN_MONTHLY_PRICE,
  territoryStatus: b.label,
}));

export function getTerritoryBracket(population: number): TerritoryBracket {
  const safe = Number.isFinite(population) ? Math.max(0, population) : 0;
  return {
    lowerBound: safe,
    upperBound: null,
    totalAvailableSlots: 1,
    monthlyPricePerSlot: territoryPrice(safe),
    territoryStatus: "US-equivalent base (pre-PPP)",
  };
}

export interface TerritoryExample {
  city: string;
  population: number;
  populationLabel: string;
}
export const CITY_EXAMPLES: readonly TerritoryExample[] = SUPPORTED_CITIES.map(
  ({ city, population, populationLabel }) => ({ city, population, populationLabel }),
);

export function formatPopulationRange(row: TerritoryBracket): string {
  const low = row.lowerBound.toLocaleString("en-US");
  const high = row.upperBound === null ? "5,000,000+" : row.upperBound.toLocaleString("en-US");
  return `${low} – ${high}`;
}
