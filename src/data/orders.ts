import type { Order } from "../types";

export const BASE_ORDERS: Order[] = [
  {
    id: "PED001",
    cliente: "Ana López",
    total: 25000,
    estado: "Pendiente",
    items: [
      {
        codigo: "P001",
        nombre: "Torta de Chocolate",
        qty: 1,
        unitPrice: 25000,
        originalUnitPrice: 25000,
        discountPerUnit: 0,
        subtotal: 25000,
        originalSubtotal: 25000
      }
    ],
    subtotal: 25000,
    discountTotal: 0,
    shippingCost: 0,
    createdAt: new Date("2024-11-15T10:15:00Z").getTime(),
    customerEmail: "ana@example.com"
  },
  {
    id: "PED002",
    cliente: "Juan Pérez",
    total: 18000,
    estado: "Enviado",
    items: [
      {
        codigo: "P003",
        nombre: "Pastel de Zanahoria",
        qty: 1,
        unitPrice: 18000,
        originalUnitPrice: 18000,
        discountPerUnit: 0,
        subtotal: 18000,
        originalSubtotal: 18000
      }
    ],
    subtotal: 18000,
    discountTotal: 0,
    shippingCost: 0,
    createdAt: new Date("2024-11-18T13:30:00Z").getTime(),
    customerEmail: "juan@example.com"
  },
  {
    id: "PED003",
    cliente: "Luis Ramírez",
    total: 32000,
    estado: "Pendiente",
    items: [
      {
        codigo: "P002",
        nombre: "Cheesecake Frutos Rojos",
        qty: 2,
        unitPrice: 16000,
        originalUnitPrice: 16000,
        discountPerUnit: 0,
        subtotal: 32000,
        originalSubtotal: 32000
      }
    ],
    subtotal: 32000,
    discountTotal: 0,
    shippingCost: 0,
    createdAt: new Date("2024-11-20T09:45:00Z").getTime(),
    customerEmail: "luis@example.com"
  }
];
