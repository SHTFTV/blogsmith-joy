import { describe, it, expect } from "vitest";
import {
  territoryPrice,
  isSoldOut,
  SLOTS_PER_CITY,
  VENDOR_ANNUAL_FEE,
  CITY_EXAMPLES,
} from "@/lib/territoryPricing";

describe("territoryPrice — formula & floor", () => {
  it("floors to $10 minimum for tiny/zero populations", () => {
    expect(territoryPrice(0)).toBe(10);
    expect(territoryPrice(1)).toBe(10);
    expect(territoryPrice(50_000)).toBe(10);
    expect(territoryPrice(99_999)).toBe(10);
  });

  it("never returns below $10 (including negative/invalid input)", () => {
    expect(territoryPrice(-100)).toBe(10);
    expect(territoryPrice(-1_000_000)).toBe(10);
  });

  it("hits $10 exactly at the 100K boundary and holds until 199,999", () => {
    expect(territoryPrice(100_000)).toBe(10);
    expect(territoryPrice(150_000)).toBe(10);
    expect(territoryPrice(199_999)).toBe(10);
  });

  it("steps by $10 every 100K", () => {
    expect(territoryPrice(200_000)).toBe(20);
    expect(territoryPrice(299_999)).toBe(20);
    expect(territoryPrice(300_000)).toBe(30);
    expect(territoryPrice(570_000)).toBe(50);
    expect(territoryPrice(675_000)).toBe(60);
    expect(territoryPrice(999_999)).toBe(90);
    expect(territoryPrice(1_000_000)).toBe(100);
  });

  it("scales linearly for megacities", () => {
    expect(territoryPrice(2_900_000)).toBe(290);
    expect(territoryPrice(9_000_000)).toBe(900);
    expect(territoryPrice(20_000_000)).toBe(2_000);
  });

  it("matches formula: max(10, floor(pop/100_000) * 10) for every reference city", () => {
    for (const c of CITY_EXAMPLES) {
      const expected = Math.max(10, Math.floor(c.population / 100_000) * 10);
      expect(territoryPrice(c.population)).toBe(expected);
    }
  });
});

describe("sold-out rule", () => {
  it("exactly 1 slot per city", () => {
    expect(SLOTS_PER_CITY).toBe(1);
  });
  it("sold out when the 1 slot is taken", () => {
    expect(isSoldOut(0)).toBe(false);
    expect(isSoldOut(1)).toBe(true);
    expect(isSoldOut(2)).toBe(true);
  });
});

describe("vendor ecosystem fee", () => {
  it("is a flat $10/year for all vendors", () => {
    expect(VENDOR_ANNUAL_FEE).toBe(10);
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
    expect(formatUsd(territoryPrice(200_000))).toBe("$20");
    expect(formatUsd(territoryPrice(2_900_000))).toBe("$290");
    expect(formatUsd(territoryPrice(20_000_000))).toBe("$2,000");
    expect(formatUsd(territoryPrice(100_000_000))).toBe("$10,000");
  });

  it("boundary values display in exact $10 increments", () => {
    const boundaries: Array<[number, string]> = [
      [0,          "$10"],
      [99_999,     "$10"],
      [100_000,    "$10"],
      [199_999,    "$10"],
      [200_000,    "$20"],
      [299_999,    "$20"],
      [300_000,    "$30"],
      [999_999,    "$90"],
      [1_000_000,  "$100"],
      [1_099_999,  "$100"],
      [1_100_000,  "$110"],
    ];
    for (const [pop, expected] of boundaries) {
      const price = territoryPrice(pop);
      expect(price % 10).toBe(0);
      expect(formatUsd(price)).toBe(expected);
    }
  });
});
