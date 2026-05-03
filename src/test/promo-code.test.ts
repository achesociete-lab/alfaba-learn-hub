import { describe, it, expect } from "vitest";

// Pure logic tests for promo code validation
function validatePromoLocally(
  code: string | null,
  opts: {
    active: boolean;
    expiryDate: Date;
    usageCount: number;
    usageLimit: number;
    discount: number;
  }
) {
  if (!code) return { valid: false, message: "Code vide" };
  if (!opts.active) return { valid: false, message: "Code inactif" };
  if (opts.expiryDate < new Date()) return { valid: false, message: "Expiré" };
  if (opts.usageCount >= opts.usageLimit) return { valid: false, message: "Limite atteinte" };
  return { valid: true, discount: opts.discount, message: `${opts.discount}% de réduction !` };
}

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

describe("Promo code validation logic", () => {
  it("should validate a valid promo code", () => {
    const result = validatePromoLocally("ALFASL30", {
      active: true,
      expiryDate: futureDate,
      usageCount: 5,
      usageLimit: 100,
      discount: 30,
    });
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(30);
  });

  it("should reject an expired code", () => {
    const result = validatePromoLocally("ALFASL30", {
      active: true,
      expiryDate: pastDate,
      usageCount: 0,
      usageLimit: 100,
      discount: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Expiré");
  });

  it("should reject an inactive code", () => {
    const result = validatePromoLocally("ALFASL30", {
      active: false,
      expiryDate: futureDate,
      usageCount: 0,
      usageLimit: 100,
      discount: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Code inactif");
  });

  it("should reject a code at usage limit", () => {
    const result = validatePromoLocally("ALFASL30", {
      active: true,
      expiryDate: futureDate,
      usageCount: 100,
      usageLimit: 100,
      discount: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Limite atteinte");
  });

  it("should reject an empty code", () => {
    const result = validatePromoLocally(null, {
      active: true,
      expiryDate: futureDate,
      usageCount: 0,
      usageLimit: 100,
      discount: 30,
    });
    expect(result.valid).toBe(false);
  });
});
