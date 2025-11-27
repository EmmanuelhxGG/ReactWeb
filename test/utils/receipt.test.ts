import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildReceiptHTML } from "../../src/utils/receipt";

// Verifica que el HTML del recibo contenga fragmentos esperados y totales formateados
describe("buildReceiptHTML", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 10, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("includes product names, totals and email when provided", () => {
    const payload = {
      items: [
        {
          product: {
            id: "P1",
            nombre: "Torta Prueba",
            precio: 10000,
            categoria: "Test",
            attr: "",
            img: "",
            stock: 1,
            stockCritico: 0
          },
          qty: 1,
          subtotal: 10000
        }
      ],
      subTotal: 10000,
      shipCost: 3000,
      total: 13000,
      benefits: { userDisc: 0, userLabel: "", bdayDisc: 0, bdayLabel: "", bdayEligible: false, bdayApplied: false },
      coupon: { valid: false, discount: 0, shipAfter: 3000 },
      currentEmail: "test@example.com"
    } as any;

    const html = buildReceiptHTML(payload);
    expect(html).toContain("Torta Prueba");
    expect(html).toContain("test@example.com");
    expect(html).toContain("Total");
    expect(html).toContain("13"); // rough check for 13000
  });
});
