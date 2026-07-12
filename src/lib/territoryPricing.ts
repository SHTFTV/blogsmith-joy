import { BUILD_COMMIT_FULL } from "./buildInfo";

// IAM TERRITORY PRICING — IMMUTABLE HARDCODED MATRIX.
// No formulas. No interpolation. Every bracket is a literal source-of-truth row.

export const PRICING_CODE_VERSION = BUILD_COMMIT_FULL;

export interface TerritoryBracket {
  lowerBound: number;
  upperBound: number | null;
  totalAvailableSlots: number;
  monthlyPricePerSlot: number;
  territoryStatus: string;
}

export const TERRITORY_MATRIX: readonly TerritoryBracket[] = [
  { lowerBound: 0, upperBound: 100_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 100_001, upperBound: 200_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 200_001, upperBound: 250_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 250_001, upperBound: 350_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 350_001, upperBound: 450_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 450_001, upperBound: 550_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 550_001, upperBound: 650_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 650_001, upperBound: 750_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 750_001, upperBound: 850_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 850_001, upperBound: 1_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 1_000_001, upperBound: 2_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 10, territoryStatus: "Baseline" },
  { lowerBound: 2_000_001, upperBound: 3_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 20, territoryStatus: "Metro" },
  { lowerBound: 3_000_001, upperBound: 4_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 30, territoryStatus: "Metro" },
  { lowerBound: 4_000_001, upperBound: 5_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 40, territoryStatus: "Metro" },
  { lowerBound: 5_000_001, upperBound: 6_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 50, territoryStatus: "Metro" },
  { lowerBound: 6_000_001, upperBound: 7_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 60, territoryStatus: "Metro" },
  { lowerBound: 7_000_001, upperBound: 8_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 70, territoryStatus: "Metro" },
  { lowerBound: 8_000_001, upperBound: 9_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 80, territoryStatus: "Metro" },
  { lowerBound: 9_000_001, upperBound: 10_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 90, territoryStatus: "Metro" },
  { lowerBound: 10_000_001, upperBound: 11_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 100, territoryStatus: "Metro" },
  { lowerBound: 11_000_001, upperBound: 12_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 110, territoryStatus: "Metro" },
  { lowerBound: 12_000_001, upperBound: 13_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 120, territoryStatus: "Metro" },
  { lowerBound: 13_000_001, upperBound: 14_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 130, territoryStatus: "Metro" },
  { lowerBound: 14_000_001, upperBound: 15_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 140, territoryStatus: "Metro" },
  { lowerBound: 15_000_001, upperBound: 16_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 150, territoryStatus: "Metro" },
  { lowerBound: 16_000_001, upperBound: 17_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 160, territoryStatus: "Metro" },
  { lowerBound: 17_000_001, upperBound: 18_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 170, territoryStatus: "Metro" },
  { lowerBound: 18_000_001, upperBound: 19_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 180, territoryStatus: "Metro" },
  { lowerBound: 19_000_001, upperBound: 20_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 190, territoryStatus: "Metro" },
  { lowerBound: 20_000_001, upperBound: 21_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 200, territoryStatus: "Metro" },
  { lowerBound: 21_000_001, upperBound: 22_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 210, territoryStatus: "Metro" },
  { lowerBound: 22_000_001, upperBound: 23_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 220, territoryStatus: "Metro" },
  { lowerBound: 23_000_001, upperBound: 24_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 230, territoryStatus: "Metro" },
  { lowerBound: 24_000_001, upperBound: 25_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 240, territoryStatus: "Metro" },
  { lowerBound: 25_000_001, upperBound: 26_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 250, territoryStatus: "Metro" },
  { lowerBound: 26_000_001, upperBound: 27_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 260, territoryStatus: "Metro" },
  { lowerBound: 27_000_001, upperBound: 28_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 270, territoryStatus: "Metro" },
  { lowerBound: 28_000_001, upperBound: 29_000_000, totalAvailableSlots: 1, monthlyPricePerSlot: 280, territoryStatus: "Metro" },
  { lowerBound: 29_000_001, upperBound: null, totalAvailableSlots: 1, monthlyPricePerSlot: 290, territoryStatus: "Metro cap" },
] as const;

export const ADDON_PRICING = {
  positionOneMultiplier: 0.5,
  backlinkPackOneTime: 25,
  talcTvVisualBlastPerPost: 10,
  hallVisualizerEyeSpyrPerRender: 2,
  guestPostAcceptedPost: 10,
} as const;

export const VENDOR_ANNUAL_FEE = 10;
export const SLOTS_PER_CITY = TERRITORY_MATRIX[0].totalAvailableSlots;

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

export function getTerritoryBracket(population: number): TerritoryBracket {
  const safePopulation = Number.isFinite(population) ? Math.max(0, population) : 0;
  return (
    TERRITORY_MATRIX.find(
      (row) => safePopulation >= row.lowerBound && (row.upperBound === null || safePopulation <= row.upperBound),
    ) ?? TERRITORY_MATRIX[0]
  );
}

export function territoryPrice(population: number): number {
  return getTerritoryBracket(population).monthlyPricePerSlot;
}

export function territorySlots(population: number): number {
  return getTerritoryBracket(population).totalAvailableSlots;
}

export function positionOneMonthlyAddon(activeSlotCost: number): number {
  return activeSlotCost * ADDON_PRICING.positionOneMultiplier;
}

export function isSoldOut(activeSlots: number, population = 0): boolean {
  return activeSlots >= territorySlots(population);
}

export function formatPopulationRange(row: TerritoryBracket): string {
  const low = row.lowerBound.toLocaleString("en-US");
  const high = row.upperBound === null ? "30,000,000+" : row.upperBound.toLocaleString("en-US");
  return `${low} – ${high}`;
}
