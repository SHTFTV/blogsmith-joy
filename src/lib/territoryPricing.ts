// IAM TERRITORY PRICING — THE 250 SCALE (HARDCODED MASTER MATRIX)
// Canonical source of truth. Shared across weddings.io and the IAM network.
// Every line item below is hardcoded per spec. No formulas, no interpolation.
// Do not modify without authorization.

export interface TerritoryBracket {
  /** Lower bound of population range (inclusive). */
  lower: number;
  /** Upper bound of population range (inclusive). Use Infinity for terminal cap. */
  upper: number;
  /** Human-readable population range label. */
  label: string;
  /** Total slots available in this bracket. */
  slots: number;
  /** Flat monthly price per slot, in USD. */
  pricePerSlot: number;
  /** Territory status label per master chart. */
  status: string;
}

export const TERRITORY_MATRIX: readonly TerritoryBracket[] = [
  { lower: 0,          upper: 10_000,      label: "10,000 (10K)",      slots: 3,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 10_001,     upper: 20_000,      label: "20,000 (20K)",      slots: 3,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 20_001,     upper: 100_000,     label: "100,000 (100K)",    slots: 3,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 100_001,    upper: 250_000,     label: "250,000 (250K)",    slots: 4,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 250_001,    upper: 400_000,     label: "400,000 (400K)",    slots: 5,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 400_001,    upper: 500_000,     label: "500,000 (500K)",    slots: 5,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 500_001,    upper: 600_000,     label: "600,000 (600K)",    slots: 6,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 600_001,    upper: 700_000,     label: "700,000 (700K)",    slots: 7,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 700_001,    upper: 800_000,     label: "800,000 (800K)",    slots: 8,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 800_001,    upper: 900_000,     label: "900,000 (900K)",    slots: 9,  pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 900_001,    upper: 1_000_000,   label: "1,000,000 (1M)",    slots: 10, pricePerSlot: 10,  status: "Flat Rate Baseline" },
  { lower: 1_000_001,  upper: 2_000_000,   label: "2,000,000 (2M)",    slots: 10, pricePerSlot: 20,  status: "Macro Tier Step" },
  { lower: 2_000_001,  upper: 3_000_000,   label: "3,000,000 (3M)",    slots: 10, pricePerSlot: 30,  status: "Macro Tier Step" },
  { lower: 3_000_001,  upper: 4_000_000,   label: "4,000,000 (4M)",    slots: 10, pricePerSlot: 40,  status: "Macro Tier Step" },
  { lower: 4_000_001,  upper: 5_000_000,   label: "5,000,000 (5M)",    slots: 10, pricePerSlot: 50,  status: "Macro Tier Step" },
  { lower: 5_000_001,  upper: 6_000_000,   label: "6,000,000 (6M)",    slots: 10, pricePerSlot: 60,  status: "Macro Tier Step" },
  { lower: 6_000_001,  upper: 7_000_000,   label: "7,000,000 (7M)",    slots: 10, pricePerSlot: 70,  status: "Macro Tier Step" },
  { lower: 7_000_001,  upper: 8_000_000,   label: "8,000,000 (8M)",    slots: 10, pricePerSlot: 80,  status: "Macro Tier Step" },
  { lower: 8_000_001,  upper: 9_000_000,   label: "9,000,000 (9M)",    slots: 10, pricePerSlot: 90,  status: "Macro Tier Step" },
  { lower: 9_000_001,  upper: 10_000_000,  label: "10,000,000 (10M)",  slots: 10, pricePerSlot: 100, status: "Macro Tier Step" },
  { lower: 10_000_001, upper: 11_000_000,  label: "11,000,000 (11M)",  slots: 10, pricePerSlot: 110, status: "Macro Tier Step" },
  { lower: 11_000_001, upper: 12_000_000,  label: "12,000,000 (12M)",  slots: 10, pricePerSlot: 120, status: "Macro Tier Step" },
  { lower: 12_000_001, upper: 13_000_000,  label: "13,000,000 (13M)",  slots: 10, pricePerSlot: 130, status: "Macro Tier Step" },
  { lower: 13_000_001, upper: 14_000_000,  label: "14,000,000 (14M)",  slots: 10, pricePerSlot: 140, status: "Macro Tier Step" },
  { lower: 14_000_001, upper: 15_000_000,  label: "15,000,000 (15M)",  slots: 10, pricePerSlot: 150, status: "Macro Tier Step" },
  { lower: 15_000_001, upper: 16_000_000,  label: "16,000,000 (16M)",  slots: 10, pricePerSlot: 160, status: "Macro Tier Step" },
  { lower: 16_000_001, upper: 17_000_000,  label: "17,000,000 (17M)",  slots: 10, pricePerSlot: 170, status: "Macro Tier Step" },
  { lower: 17_000_001, upper: 18_000_000,  label: "18,000,000 (18M)",  slots: 10, pricePerSlot: 180, status: "Macro Tier Step" },
  { lower: 18_000_001, upper: 19_000_000,  label: "19,000,000 (19M)",  slots: 10, pricePerSlot: 190, status: "Macro Tier Step" },
  { lower: 19_000_001, upper: 20_000_000,  label: "20,000,000 (20M)",  slots: 10, pricePerSlot: 200, status: "Macro Tier Step" },
  { lower: 20_000_001, upper: 21_000_000,  label: "21,000,000 (21M)",  slots: 10, pricePerSlot: 210, status: "Macro Tier Step" },
  { lower: 21_000_001, upper: 22_000_000,  label: "22,000,000 (22M)",  slots: 10, pricePerSlot: 220, status: "Macro Tier Step" },
  { lower: 22_000_001, upper: 23_000_000,  label: "23,000,000 (23M)",  slots: 10, pricePerSlot: 230, status: "Macro Tier Step" },
  { lower: 23_000_001, upper: 24_000_000,  label: "24,000,000 (24M)",  slots: 10, pricePerSlot: 240, status: "Macro Tier Step" },
  { lower: 24_000_001, upper: 25_000_000,  label: "25,000,000 (25M)",  slots: 10, pricePerSlot: 250, status: "Macro Tier Step" },
  { lower: 25_000_001, upper: 26_000_000,  label: "26,000,000 (26M)",  slots: 10, pricePerSlot: 260, status: "Macro Tier Step" },
  { lower: 26_000_001, upper: 27_000_000,  label: "27,000,000 (27M)",  slots: 10, pricePerSlot: 270, status: "Macro Tier Step" },
  { lower: 27_000_001, upper: 28_000_000,  label: "28,000,000 (28M)",  slots: 10, pricePerSlot: 280, status: "Macro Tier Step" },
  { lower: 28_000_001, upper: 29_000_000,  label: "29,000,000 (29M)",  slots: 10, pricePerSlot: 290, status: "Macro Tier Step" },
  { lower: 29_000_001, upper: Infinity,    label: "30,000,000 (30M)",  slots: 10, pricePerSlot: 10,  status: "Terminal Metro Cap" },
] as const;

/** Hardcoded add-on costs. Flat. No interpolation. */
export const ADDON_PRICING = {
  /** Position #1 placement: 50% of the active slot cost added to monthly billing. */
  position1Multiplier: 0.5,
  /** High-Authority Backlink Pack — one-time. */
  backlinkPack: 25,
  /** TALC.tv Visual Blast — per post. */
  talcBlast: 10,
  /** Hall Visualizer (EyeSpyR Engine) — per render. */
  hallVisualizer: 2,
} as const;

/** Lookup the bracket containing the given population, by direct table scan. */
export function lookupTerritoryBracket(population: number): TerritoryBracket {
  for (const b of TERRITORY_MATRIX) {
    if (population >= b.lower && population <= b.upper) return b;
  }
  return TERRITORY_MATRIX[TERRITORY_MATRIX.length - 1];
}

export interface TerritoryPricing {
  slots: number;
  pricePerSlot: number;
  totalIfFull: number;
}

export function getTerritoryPricing(population: number): TerritoryPricing {
  const b = lookupTerritoryBracket(population);
  return { slots: b.slots, pricePerSlot: b.pricePerSlot, totalIfFull: b.slots * b.pricePerSlot };
}

/** A city-category is SOLD OUT only when active_slots >= max_slots for that bracket. */
export function isSoldOut(activeSlots: number, population: number): boolean {
  return activeSlots >= lookupTerritoryBracket(population).slots;
}

/** Position #1 monthly upsell cost for a given active slot price. */
export function position1MonthlyCost(activeSlotPrice: number): number {
  return activeSlotPrice * ADDON_PRICING.position1Multiplier;
}

// Legacy helpers kept for backwards compatibility with existing callers.
export function calculateSlotCount(population: number): number {
  return lookupTerritoryBracket(population).slots;
}
export function calculateSlotPrice(population: number): number {
  return lookupTerritoryBracket(population).pricePerSlot;
}
