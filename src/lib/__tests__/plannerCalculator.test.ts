import { describe, it, expect } from "vitest";
import { territoryPrice } from "@/lib/territoryPricing";

// Mirrors PlannerPriceCalculator input parser in src/routes/index.tsx
function parsePop(input: string): number {
  const n = Number(input.replace(/[,\s_]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

describe("PlannerPriceCalculator — edge cases", () => {
  it("returns min $10 for blank input", () => {
    expect(territoryPrice(parsePop(""))).toBe(10);
  });

  it("returns min $10 for non-numeric input", () => {
    for (const bad of ["abc", "$$$", "twelve", "--", "NaN"]) {
      expect(territoryPrice(parsePop(bad))).toBe(10);
    }
  });

  it("accepts comma/space/underscore separators", () => {
    expect(territoryPrice(parsePop("1,500,000"))).toBe(10);
    expect(territoryPrice(parsePop("1 500 000"))).toBe(10);
    expect(territoryPrice(parsePop("1_500_000"))).toBe(10);
  });

  it("clamps negatives to the $10 floor", () => {
    expect(territoryPrice(parsePop("-500000"))).toBe(10);
  });

  it("handles very large populations without breaking", () => {
    expect(territoryPrice(20_000_000)).toBe(190);
    expect(territoryPrice(100_000_000)).toBe(290);
    expect(territoryPrice(1_000_000_000)).toBe(290);
  });
});

describe("PlannerPriceCalculator — bounds & wording", () => {
  it("min bound is exactly $10/mo across small populations", () => {
    for (const p of [0, 1, 50_000, 99_999, 100_000, 199_999]) {
      expect(fmt(territoryPrice(p))).toBe("$10");
    }
  });

  it("Mumbai (20M) resolves to the hardcoded matrix row", () => {
    expect(fmt(territoryPrice(20_000_000))).toBe("$190");
  });

  it("boundary populations use exact matrix values", () => {
    const boundaries: Array<[number, string]> = [
      [200_000, "$10"],
      [300_000, "$10"],
      [1_000_000, "$10"],
      [2_500_000, "$20"],
      [9_000_000, "$80"],
    ];
    for (const [pop, expected] of boundaries) {
      expect(fmt(territoryPrice(pop))).toBe(expected);
    }
  });
});
