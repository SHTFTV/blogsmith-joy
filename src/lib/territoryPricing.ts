// IAM TERRITORY PRICING — THE 250 SCALE
// Canonical source of truth. Shared across weddings.io, budgetroofers.ca,
// industryarmymarketing.com, carpenters.ltd. Do not modify without authorization.
//
// Rule: every city starts at 3 slots minimum, cap is 10, price doubles at 1M
// then steps $10/million, capping at $50/slot for 4M+ cities.

export function calculateSlotCount(population: number): number {
  if (population < 250000) return 3;
  if (population < 300000) return 4;
  if (population < 500000) return 4;
  if (population < 600000) return 6;
  if (population < 700000) return 7;
  if (population < 1000000) return 9;
  return 10; // Hard cap at 10. Never exceeds 10.
}

export function calculateSlotPrice(population: number): number {
  if (population < 1000000) return 10;
  if (population < 2000000) return 20;
  if (population < 3000000) return 30;
  if (population < 4000000) return 40;
  return 50; // Caps at $50/slot for 4M+ cities
}

export interface TerritoryPricing {
  slots: number;
  pricePerSlot: number;
  totalIfFull: number;
}

export function getTerritoryPricing(population: number): TerritoryPricing {
  const slots = calculateSlotCount(population);
  const pricePerSlot = calculateSlotPrice(population);
  return {
    slots,
    pricePerSlot,
    totalIfFull: slots * pricePerSlot,
  };
}

/** A city-category is sold out when active_slots >= max_slots for that city. */
export function isSoldOut(activeSlots: number, population: number): boolean {
  return activeSlots >= calculateSlotCount(population);
}
