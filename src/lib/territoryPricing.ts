import { BUILD_COMMIT_FULL } from "./buildInfo";

// IAM TERRITORY PRICING — formula-driven, one exclusive SEO Marketing Page per city.
// Rule: $10 USD per 100,000 population, rounded down to nearest $10, minimum $10.
// No odd numbers. No interpolation. Same formula worldwide.

export const PRICING_CODE_VERSION = BUILD_COMMIT_FULL;
export const PRICE_PER_100K = 10;
export const MIN_MONTHLY_PRICE = 10;
export const BRACKET_STEP = 100_000;

export interface TerritoryBracket {
  lowerBound: number;
  upperBound: number | null;
  totalAvailableSlots: number;
  monthlyPricePerSlot: number;
  territoryStatus: string;
}

function buildBracket(index: number, isOpenEnded: boolean): TerritoryBracket {
  // Bracket k covers [k*100K, (k+1)*100K - 1]; price = max($10, k*$10) — same as floor(pop/100K)*10.
  const lowerBound = index * BRACKET_STEP;
  const upperBound = isOpenEnded ? null : (index + 1) * BRACKET_STEP - 1;
  const price = Math.max(MIN_MONTHLY_PRICE, index * PRICE_PER_100K);
  return {
    lowerBound,
    upperBound,
    totalAvailableSlots: 1,
    monthlyPricePerSlot: price,
    territoryStatus: isOpenEnded ? "Formula (+$10 per 100K)" : "Baseline",
  };
}

// Display matrix: 11 clean 100K brackets (0 → 1M) + one open-ended row above 1M.
// Any population is priced by the same $10-per-100K formula.
export const TERRITORY_MATRIX: readonly TerritoryBracket[] = [
  buildBracket(0, false),
  buildBracket(1, false),
  buildBracket(2, false),
  buildBracket(3, false),
  buildBracket(4, false),
  buildBracket(5, false),
  buildBracket(6, false),
  buildBracket(7, false),
  buildBracket(8, false),
  buildBracket(9, false),
  buildBracket(10, true),
] as const;

export const ADDON_PRICING = {
  creatorOutstandingBusinessMonthlyBase: 10,
  backlinkPackOneTime: 25,
  talcTvVisualBlastPerPost: 10,
  guestPostAcceptedPost: 10,
} as const;

export const VENDOR_ANNUAL_FEE = 10;
export const SLOTS_PER_CITY = 1;

export interface TerritoryExample {
  city: string;
  population: number;
  populationLabel: string;
}

export const CITY_EXAMPLES: readonly TerritoryExample[] = [
  { city: "Aldergrove, BC", population: 50_000, populationLabel: "50K" },
  { city: "Langley, BC", population: 180_000, populationLabel: "180K" },
  { city: "Burnaby, BC", population: 245_000, populationLabel: "245K" },
  { city: "Surrey, BC", population: 570_000, populationLabel: "570K" },
  { city: "Vancouver, BC", population: 675_000, populationLabel: "675K" },
  { city: "Toronto, ON", population: 2_900_000, populationLabel: "2.9M" },
  { city: "Dubai, UAE", population: 3_500_000, populationLabel: "3.5M" },
  { city: "New York, USA", population: 8_300_000, populationLabel: "8.3M" },
  { city: "London, UK", population: 9_000_000, populationLabel: "9M" },
  { city: "Mumbai, India", population: 20_000_000, populationLabel: "20M" },
] as const;

export function territoryPrice(population: number): number {
  const safe = Number.isFinite(population) ? Math.max(0, population) : 0;
  return Math.max(MIN_MONTHLY_PRICE, Math.floor(safe / BRACKET_STEP) * PRICE_PER_100K);
}

export function getTerritoryBracket(population: number): TerritoryBracket {
  const safe = Number.isFinite(population) ? Math.max(0, population) : 0;
  const inMatrix = TERRITORY_MATRIX.find(
    (row) => safe >= row.lowerBound && (row.upperBound === null || safe <= row.upperBound),
  );
  if (inMatrix && inMatrix.upperBound !== null) return inMatrix;
  // Open-ended tier: return a dynamic row priced by formula so the calculator stays accurate.
  return {
    lowerBound: 1_000_000,
    upperBound: null,
    totalAvailableSlots: 1,
    monthlyPricePerSlot: territoryPrice(safe),
    territoryStatus: "Formula (+$10 per 100K)",
  };
}

export function territorySlots(_population: number): number {
  return SLOTS_PER_CITY;
}

export function isSoldOut(activeSlots: number, _population = 0): boolean {
  return activeSlots >= SLOTS_PER_CITY;
}

export function formatPopulationRange(row: TerritoryBracket): string {
  const low = row.lowerBound.toLocaleString("en-US");
  const high = row.upperBound === null ? "1,000,000+" : row.upperBound.toLocaleString("en-US");
  return `${low} – ${high}`;
}
