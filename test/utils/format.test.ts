import { it, expect, describe } from "vitest";
import { formatMoney } from "../../src/utils/format";

// Verifica el comportamiento de formateo de moneda (independiente del entorno)
describe("formatMoney", () => {
  it("formats numbers as currency-like string without decimal cents", () => {
    const s = formatMoney(45000);
    // Contains digits
    expect(s).toMatch(/\d/);
    // No fractional cents: disallow a decimal separator followed by 1-2 digits
    // that are then followed only by non-digits until the end (this avoids
    // matching thousands separators like "45.000" which have 3-digit groups).
    expect(/[.,]\d{1,2}(?=\D*$)/.test(s)).toBe(false);
  });
});
