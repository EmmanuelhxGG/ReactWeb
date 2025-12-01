import { describe, it, expect } from "vitest";
import { cleanRun, isRunValid } from "../../src/utils/validators";

// Pruebas de limpieza y validación del RUN
describe("validators.cleanRun / isRunValid", () => {
  it("cleanRun removes dots and lowercases K to uppercase", () => {
    expect(cleanRun("12.345.678-k")).toBe("12345678K");
    expect(cleanRun(" 1.2.3.4 ")).toBe("1234");
  });

  it("isRunValid returns true for programmatically generated valid run", () => {
    // Create a numeric body and compute its dv using same algorithm
    const body = "12345678"; // arbitrary body
    // compute dv using same algorithm as production to generate a valid run for test
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]!, 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const rest = 11 - (sum % 11);
    const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);
    const candidate = `${body}${expected}`;
    expect(isRunValid(candidate)).toBe(true);
  });
});
