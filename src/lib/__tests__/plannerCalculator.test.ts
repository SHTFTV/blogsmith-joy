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
    expect(territoryPrice(parsePop("1,500,000"))).toBe(150);
    expect(territoryPrice(parsePop("1 500 000"))).toBe(150);
    expect(territoryPrice(parsePop("1_500_000"))).toBe(150);
  });

  it("clamps negatives to the $10 floor", () => {
    expect(territoryPrice(parsePop("-500000"))).toBe(10);
  });

  it("handles very large populations without breaking", () => {
    expect(territoryPrice(20_000_000)).toBe(2_000);
    expect(territoryPrice(100_000_000)).toBe(10_000);
    expect(territoryPrice(1_000_000_000)).toBe(100_000);
  });
});

describe("PlannerPriceCalculator — bounds & wording", () => {
  it("min bound is exactly $10/mo across small populations", () => {
    for (const p of [0, 1, 50_000, 99_999, 100_000, 199_999]) {
      expect(fmt(territoryPrice(p))).toBe("$10");
    }
  });

  it("Mumbai (20M) resolves to the stated ~$2,000/mo max marker", () => {
    expect(fmt(territoryPrice(20_000_000))).toBe("$2,000");
  });

  it("boundary populations step in $10 increments", () => {
    const boundaries: Array<[number, string]> = [
      [200_000, "$20"],
      [300_000, "$30"],
      [1_000_000, "$100"],
      [2_500_000, "$250"],
      [9_000_000, "$900"],
    ];
    for (const [pop, expected] of boundaries) {
      expect(fmt(territoryPrice(pop))).toBe(expected);
    }
  });
});
