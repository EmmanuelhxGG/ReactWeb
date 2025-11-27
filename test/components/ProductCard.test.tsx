import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Simular el hook `useAppContext` para poder afirmar que `addToCart` es llamado
const mockAdd = vi.fn();
const mockGetPricing = vi.fn(() => ({
  originalUnitPrice: 10000,
  unitPrice: 10000,
  discountPercent: 0,
  discountPerUnit: 0,
  originalTotal: 10000,
  discountTotal: 0,
  total: 10000
}));
vi.mock("../../src/context/AppContext", () => ({
  useAppContext: () => ({ addToCart: mockAdd, getProductPricing: mockGetPricing })
}));

// Simular `Link` de `react-router-dom` para evitar importar internals del router
vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: any) => {
    return (
      // eslint-disable-next-line react/jsx-no-bind
      // sustituto simple de un anchor
      <a href={to}>{children}</a>
    );
  }
}));

import { ProductCard } from "../../src/components/products/ProductCard";

// Verifica que `ProductCard` renderiza la información del producto y dispara `addToCart`
describe("ProductCard component", () => {
  it("renders name, price and calls addToCart on button click", () => {
    const product = {
      id: "P1",
      nombre: "Torta X",
      precio: 10000,
      categoria: "T",
      attr: "20 porciones",
      img: "/img/x.png",
      stock: 5,
      stockCritico: 1
    } as any;

    render(<ProductCard product={product} />);

    expect(screen.getByText(/Torta X/)).toBeDefined();
    expect(mockGetPricing).toHaveBeenCalledWith(product, 1);

    const btn = screen.getByRole("button", { name: /Añadir/i });
    fireEvent.click(btn);
    expect(mockAdd).toHaveBeenCalledWith("P1", 1);
  });
});
