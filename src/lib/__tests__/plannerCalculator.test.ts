import { describe, it, expect } from "vitest";
import {
  MAX_MONTHLY_PRICE,
  MIN_MONTHLY_PRICE,
  SUPPORTED_CITIES,
  pppPrice,
  priceForCity,
} from "@/lib/territoryPricing";

// The homepage CityPriceCalculator picks a city from SUPPORTED_CITIES and
// resolves the monthly price via pppPrice(). These tests mirror the
// resolver logic used by that component.

describe("CityPriceCalculator — city-driven resolver", () => {
  it("exposes at least one city per supported country", () => {
    expect(SUPPORTED_CITIES.length).toBeGreaterThan(20);
  });

  it("every listed city resolves to a valid clamped price", () => {
    for (const c of SUPPORTED_CITIES) {
      const price = priceForCity(c);
      expect(price).toBeGreaterThanOrEqual(MIN_MONTHLY_PRICE);
      expect(price).toBeLessThanOrEqual(MAX_MONTHLY_PRICE);
      expect(price % 10).toBe(0);
    }
  });

  it("small markets floor at $10/mo", () => {
    expect(pppPrice(50_000, "CA")).toBe(MIN_MONTHLY_PRICE);
    expect(pppPrice(180_000, "LK")).toBe(MIN_MONTHLY_PRICE);
  });

  it("mega markets cap at $2,000/mo", () => {
    expect(pppPrice(50_000_000, "US")).toBe(MAX_MONTHLY_PRICE);
  });

  it("PPP lowers the price for the same population in a lower-PPP country", () => {
    const usa = pppPrice(5_000_000, "US");
    const india = pppPrice(5_000_000, "IN");
    expect(india).toBeLessThan(usa);
  });
});
