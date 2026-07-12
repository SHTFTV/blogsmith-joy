import { describe, it, expect } from "vitest";
import {
  ADDON_PRICING,
  TERRITORY_MATRIX,
  getTerritoryBracket,
  territoryPrice,
  isSoldOut,
  SLOTS_PER_CITY,
  VENDOR_ANNUAL_FEE,
  CITY_EXAMPLES,
} from "@/lib/territoryPricing";

describe("territoryPrice — $10 per 100K formula", () => {
  it("uses clean 100K brackets from 0 to 1M in the display matrix", () => {
    expect(TERRITORY_MATRIX).toHaveLength(10);
    expect(TERRITORY_MATRIX[0].monthlyPricePerSlot).toBe(10);
    expect(TERRITORY_MATRIX[9].upperBound).toBeNull();
  });

  it("prices every 100K bracket in $10 increments (no odd numbers)", () => {
    const pops = [100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000];
    const expected = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    pops.forEach((p, i) => {
      expect(territoryPrice(p)).toBe(expected[i]);
      expect(territoryPrice(p) % 10).toBe(0);
    });
  });

  it("applies the formula above 1M with no cap", () => {
    expect(territoryPrice(2_900_000)).toBe(290);
    expect(territoryPrice(8_300_000)).toBe(830);
    expect(territoryPrice(9_000_000)).toBe(900);
    expect(territoryPrice(20_000_000)).toBe(2_000);
  });

  it("enforces $10 minimum for small populations", () => {
    expect(territoryPrice(0)).toBe(10);
    expect(territoryPrice(50_000)).toBe(10);
    expect(territoryPrice(99_999)).toBe(10);
  });

  it("every reference city resolves to a formula-priced bracket", () => {
    for (const c of CITY_EXAMPLES) {
      expect(getTerritoryBracket(c.population).monthlyPricePerSlot).toBe(territoryPrice(c.population));
    }
  });
});

describe("sold-out rule", () => {
  it("baseline territory count is 1 (one exclusive SEO Marketing Page per city)", () => {
    expect(SLOTS_PER_CITY).toBe(1);
  });
  it("sold out as soon as the single territory is filled", () => {
    expect(isSoldOut(0)).toBe(false);
    expect(isSoldOut(1)).toBe(true);
  });
});

describe("vendor ecosystem fee & add-ons", () => {
  it("is a flat $10/year for all vendors", () => {
    expect(VENDOR_ANNUAL_FEE).toBe(10);
  });
  it("keeps add-ons flat", () => {
    expect(ADDON_PRICING.backlinkPackOneTime).toBe(25);
    expect(ADDON_PRICING.talcTvVisualBlastPerPost).toBe(10);
    expect(ADDON_PRICING.hallVisualizerEyeSpyrPerRender).toBe(2);
    expect(ADDON_PRICING.guestPostAcceptedPost).toBe(10);
  });
});

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

describe("currency formatting", () => {
  it("uses whole-dollar formatting (no decimal places)", () => {
    for (const pop of [0, 99_999, 100_000, 570_000, 2_900_000, 20_000_000]) {
      const s = formatUsd(territoryPrice(pop));
      expect(s.startsWith("$")).toBe(true);
      expect(s).not.toMatch(/\./);
    }
  });

  it("boundary values display exact formula-driven values", () => {
    const boundaries: Array<[number, string]> = [
      [0,          "$10"],
      [99_999,     "$10"],
      [100_000,    "$10"],
      [200_000,    "$20"],
      [570_000,    "$50"],
      [1_000_000,  "$100"],
      [2_900_000,  "$290"],
      [9_000_000,  "$900"],
      [20_000_000, "$2,000"],
    ];
    for (const [pop, expected] of boundaries) {
      expect(formatUsd(territoryPrice(pop))).toBe(expected);
    }
  });
});
