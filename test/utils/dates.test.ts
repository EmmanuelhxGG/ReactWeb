import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseLocalDate, computeAge, isBirthdayToday } from "../../src/utils/dates";

// Pruebas de parseLocalDate, computeAge e isBirthdayToday con tiempo controlado
describe("dates utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed today: 2025-11-15
    vi.setSystemTime(new Date(2025, 10, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parseLocalDate returns Date for valid yyyy-mm-dd and null for invalid", () => {
    // Should parse correctly
    const ok = parseLocalDate("2000-02-29");
    expect(ok).toBeInstanceOf(Date);
    // Invalid dates or formats
    expect(parseLocalDate("not-a-date")).toBeNull();
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
  });

  it("computeAge returns correct age based on today", () => {
    // Born 1990-11-15 -> should be 35 on 2025-11-15
    expect(computeAge("1990-11-15")).toBe(35);
    // Born later in month -> age one less
    expect(computeAge("1990-11-16")).toBe(34);
    // Invalid input -> null
    expect(computeAge("abc")).toBeNull();
  });

  it("isBirthdayToday detects birthday when month+day match system date", () => {
    // Same month/day as our fake today
    expect(isBirthdayToday("2000-11-15")).toBe(true);
    // Different day -> false
    expect(isBirthdayToday("2000-11-14")).toBe(false);
  });
});
