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

describe("territoryPrice — immutable matrix", () => {
  it("contains exactly 39 hardcoded brackets", () => {
    expect(TERRITORY_MATRIX).toHaveLength(39);
  });

  it("uses the baseline rows exactly", () => {
    expect(territoryPrice(0)).toBe(10);
    expect(territoryPrice(50_000)).toBe(10);
    expect(getTerritoryBracket(50_000).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(245_000).totalAvailableSlots).toBe(1);
  });

  it("uses 1 slot per city across all population tiers", () => {
    expect(getTerritoryBracket(250_001).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(450_001).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(570_000).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(675_000).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(850_001).totalAvailableSlots).toBe(1);
    expect(getTerritoryBracket(20_000_000).totalAvailableSlots).toBe(1);
  });

  it("keeps $10 baseline through 2M", () => {
    expect(territoryPrice(1_000_000)).toBe(10);
    expect(territoryPrice(1_500_000)).toBe(10);
    expect(territoryPrice(2_000_000)).toBe(10);
  });

  it("uses exact macro tier rows and terminal cap", () => {
    expect(territoryPrice(2_000_001)).toBe(20);
    expect(territoryPrice(9_000_000)).toBe(80);
    expect(territoryPrice(9_000_001)).toBe(90);
    expect(territoryPrice(20_000_000)).toBe(190);
    expect(territoryPrice(29_000_001)).toBe(290);
    expect(territoryPrice(100_000_000)).toBe(290);
  });

  it("every reference city resolves from a matrix row", () => {
    for (const c of CITY_EXAMPLES) {
      expect(TERRITORY_MATRIX).toContain(getTerritoryBracket(c.population));
    }
  });
});

describe("sold-out rule", () => {
  it("baseline slot count is 3", () => {
    expect(SLOTS_PER_CITY).toBe(3);
  });
  it("sold out only when exact bracket slots are filled", () => {
    expect(isSoldOut(0)).toBe(false);
    expect(isSoldOut(2)).toBe(false);
    expect(isSoldOut(3)).toBe(true);
    expect(isSoldOut(6, 570_000)).toBe(false);
    expect(isSoldOut(7, 570_000)).toBe(true);
  });
});

describe("vendor ecosystem fee", () => {
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

// Mirrors formatUsd() in src/routes/pricing.tsx — whole-dollar, comma-grouped, no decimals.
function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

describe("currency formatting", () => {
  it("uses whole-dollar formatting (no decimal places)", () => {
    for (const pop of [0, 99_999, 100_000, 199_999, 200_000, 1_000_000, 20_000_000]) {
      const s = formatUsd(territoryPrice(pop));
      expect(s.startsWith("$")).toBe(true);
      expect(s).not.toMatch(/\./); // no decimal separator
      expect(s).not.toMatch(/[^\$\d,]/); // only $, digits, commas
    }
  });

  it("comma-groups thousands consistently", () => {
    expect(formatUsd(territoryPrice(200_000))).toBe("$10");
    expect(formatUsd(territoryPrice(2_900_000))).toBe("$20");
    expect(formatUsd(territoryPrice(20_000_000))).toBe("$190");
    expect(formatUsd(territoryPrice(100_000_000))).toBe("$290");
  });

  it("boundary values display exact hardcoded values", () => {
    const boundaries: Array<[number, string]> = [
      [0,          "$10"],
      [99_999,     "$10"],
      [100_000,    "$10"],
      [199_999,    "$10"],
      [200_000,    "$10"],
      [299_999,    "$10"],
      [300_000,    "$10"],
      [999_999,    "$10"],
      [1_000_000,  "$10"],
      [1_099_999,  "$10"],
      [1_100_000,  "$10"],
      [2_000_001,  "$20"],
      [29_000_001, "$290"],
    ];
    for (const [pop, expected] of boundaries) {
      const price = territoryPrice(pop);
      expect(price % 10).toBe(0);
      expect(formatUsd(price)).toBe(expected);
    }
  });
});
