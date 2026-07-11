// IAM TERRITORY PRICING — SIMPLE FORMULA
// One territory per city. $10 USD per 100,000 population, rounded down. Minimum $10.
// Canonical source of truth. Do not modify without authorization.

/** Slots per city. Always exactly one. */
export const SLOTS_PER_CITY = 1;

/** Vendor ecosystem + bidding platform access. Flat annual fee. */
export const VENDOR_ANNUAL_FEE = 10;

/**
 * Territory price for a given city population.
 * Formula: max(10, floor(pop / 100_000) * 10).
 */
export function territoryPrice(population: number): number {
  const raw = Math.floor(Math.max(0, population) / 100_000) * 10;
  return Math.max(10, raw);
}

export interface TerritoryExample {
  city: string;
  population: number;
  populationLabel: string;
}

/** Reference cities used on the pricing page. */
export const CITY_EXAMPLES: readonly TerritoryExample[] = [
  { city: "Aldergrove, BC",   population: 50_000,     populationLabel: "50K" },
  { city: "Langley, BC",      population: 180_000,    populationLabel: "180K" },
  { city: "Burnaby, BC",      population: 245_000,    populationLabel: "245K" },
  { city: "Surrey, BC",       population: 570_000,    populationLabel: "570K" },
  { city: "Vancouver, BC",    population: 675_000,    populationLabel: "675K" },
  { city: "Toronto, ON",      population: 2_900_000,  populationLabel: "2.9M" },
  { city: "Dubai, UAE",       population: 3_500_000,  populationLabel: "3.5M" },
  { city: "New York, USA",    population: 8_300_000,  populationLabel: "8.3M" },
  { city: "London, UK",       population: 9_000_000,  populationLabel: "9M" },
  { city: "Mumbai, India",    population: 20_000_000, populationLabel: "20M" },
] as const;

/** A city territory is sold out when it already has one active slot. */
export function isSoldOut(activeSlots: number): boolean {
  return activeSlots >= SLOTS_PER_CITY;
}
