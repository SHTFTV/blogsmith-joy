import { describe, it, expect } from "vitest";
import {
  ADDON_PRICING,
  COUNTRY_PPP,
  MAX_MONTHLY_PRICE,
  MIN_MONTHLY_PRICE,
  SLOTS_PER_CITY,
  SUPPORTED_CITIES,
  VENDOR_ANNUAL_FEE,
  isSoldOut,
  pppIndex,
  pppPrice,
  priceForCity,
  territoryPrice,
} from "@/lib/territoryPricing";

describe("territoryPrice — pre-PPP base", () => {
  it("uses $10 per 100K population with a $10 floor", () => {
    expect(territoryPrice(0)).toBe(10);
    expect(territoryPrice(50_000)).toBe(10);
    expect(territoryPrice(100_000)).toBe(10);
    expect(territoryPrice(1_000_000)).toBe(100);
    expect(territoryPrice(20_000_000)).toBe(2_000);
  });
});

describe("pppIndex", () => {
  it("returns 1.0 for US and a lookup value for supported countries", () => {
    expect(pppIndex("US")).toBe(1.0);
    expect(pppIndex("IN")).toBe(COUNTRY_PPP.IN);
    expect(pppIndex("GB")).toBe(COUNTRY_PPP.GB);
  });
  it("defaults to 1.0 for unknown countries", () => {
    expect(pppIndex("ZZ")).toBe(1.0);
  });
});

describe("pppPrice — clamp & scaling", () => {
  it("never returns less than $10", () => {
    expect(pppPrice(0, "IN")).toBe(MIN_MONTHLY_PRICE);
    expect(pppPrice(50_000, "PK")).toBe(MIN_MONTHLY_PRICE);
  });

  it("caps at $2,000/mo regardless of population", () => {
    expect(pppPrice(100_000_000, "US")).toBe(MAX_MONTHLY_PRICE);
    expect(pppPrice(1_000_000_000, "GB")).toBe(MAX_MONTHLY_PRICE);
  });

  it("scales down for lower-PPP countries", () => {
    // New York (8.3M, US) — base $830 × 1.0 = $830
    expect(pppPrice(8_300_000, "US")).toBe(830);
    // Mumbai (20M, IN) — base $2000 × 0.28 = $560
    expect(pppPrice(20_000_000, "IN")).toBe(560);
    // London (9M, GB) — base $900 × 0.72 = $650 (rounded to nearest $10)
    expect(pppPrice(9_000_000, "GB")).toBe(650);
  });

  it("returns whole $10 increments", () => {
    for (const c of SUPPORTED_CITIES) {
      expect(priceForCity(c) % 10).toBe(0);
      expect(priceForCity(c)).toBeGreaterThanOrEqual(MIN_MONTHLY_PRICE);
      expect(priceForCity(c)).toBeLessThanOrEqual(MAX_MONTHLY_PRICE);
    }
  });
});

describe("sold-out rule", () => {
  it("baseline territory count is 1 (one exclusive planner per city)", () => {
    expect(SLOTS_PER_CITY).toBe(1);
  });
  it("sold out as soon as the single territory is filled", () => {
    expect(isSoldOut(0)).toBe(false);
    expect(isSoldOut(1)).toBe(true);
  });
});

describe("optional extras (add-ons) — flat prices, not buried in fine print", () => {
  it("keeps vendor ecosystem fee at flat $10/year", () => {
    expect(VENDOR_ANNUAL_FEE).toBe(10);
  });
  it("keeps add-on prices clean and predictable", () => {
    expect(ADDON_PRICING.creatorOutstandingBusinessMonthlyBase).toBe(10);
    expect(ADDON_PRICING.backlinkPackOneTime).toBe(25);
    expect(ADDON_PRICING.talcTvVisualBlastPerPost).toBe(10);
    expect(ADDON_PRICING.hallVisualizerPerRender).toBe(2);
    expect(ADDON_PRICING.guestPostAcceptedPost).toBe(10);
  });
});
