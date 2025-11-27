import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Simular `useAppContext` para proporcionar el estado del carrito y espiar acciones
const mockOpenReceipt = vi.fn();
const mockUpdateCustomer = vi.fn();
const mockClearCart = vi.fn();
const mockUpsertProduct = vi.fn();
vi.mock("../../src/context/AppContext", () => ({
  useAppContext: () => ({
    cartTotals: {
      items: [
        {
          product: { id: "P1", nombre: "T1", precio: 1000, categoria: "C", attr: "", img: "", stock: 5, stockCritico: 0 },
          qty: 1,
          subtotal: 1000,
          pricing: {
            originalUnitPrice: 1000,
            unitPrice: 1000,
            discountPercent: 0,
            discountPerUnit: 0,
            originalTotal: 1000,
            discountTotal: 0,
            total: 1000
          }
        }
      ],
      subTotal: 1000,
      effectiveSubtotal: 1000,
      discountTotal: 0,
      totalQty: 1
    },
    removeFromCart: vi.fn(),
    setCartQty: vi.fn(),
    clearCart: mockClearCart,
    shippingCost: 0,
    setShippingCost: vi.fn(),
    coupon: '',
    setCoupon: vi.fn(),
    evaluateCoupon: () => ({ valid: false, discount: 0, shipAfter: 0 }),
    benefitsForCart: () => ({
      userDisc: 0,
      userLabel: '',
      bdayDisc: 0,
      bdayLabel: '',
      bdayEligible: false,
      bdayApplied: false,
      freeShipping: false,
      shippingLabel: ''
    }),
    customerSession: { email: 'a@a.com', nombre: 'A' },
    updateCustomer: mockUpdateCustomer,
    openReceiptWindow: mockOpenReceipt,
    products: [{ id: 'P1', nombre: 'T1', precio: 1000, categoria: 'C', attr: '', img: '', stock: 5, stockCritico: 0 }],
    upsertProduct: mockUpsertProduct,
    orders: [],
    updateOrders: vi.fn()
  })
}));

import { MemoryRouter } from "react-router-dom";
import { CarritoPage } from "../../src/pages/CarritoPage";

// Verifica que el checkout dispara `openReceiptWindow`, actualiza stock del producto y limpia el carrito
describe("CarritoPage checkout flow", () => {
  it("opens receipt, updates product stock and clears cart on checkout", () => {
    render(
      <MemoryRouter>
        <CarritoPage />
      </MemoryRouter>
    );
    const btn = screen.getByRole("button", { name: /Finalizar compra/i });
    fireEvent.click(btn);
    expect(mockOpenReceipt).toHaveBeenCalled();
    expect(mockUpsertProduct).toHaveBeenCalled();
    expect(mockClearCart).toHaveBeenCalled();
  });
});
