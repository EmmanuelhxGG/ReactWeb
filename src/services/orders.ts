import { request } from "./http";

export type OrderStatusDto = "PENDIENTE" | "EN_PROCESO" | "ENVIADO" | "CANCELADO" | "COMPLETADO";

export type CreateOrderItemRequestDto = {
  productId: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  discountPerUnit: number;
  benefitLabels?: string[] | null;
  note?: string | null;
};

export type CreateOrderRequestDto = {
  items: CreateOrderItemRequestDto[];
  shippingCost: number;
  benefitsApplied?: string[] | null;
  couponCode?: string | null;
  couponLabel?: string | null;
  notes?: string | null;
  shippingAddressId?: string | null;
};

export type OrderItemResponseDto = {
  codigo: string;
  nombre: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  discountPerUnit: number;
  subtotal: number;
  originalSubtotal: number;
  benefitLabels: string[] | null;
};

export type OrderResponseDto = {
  id: string;
  orderCode: string;
  status: OrderStatusDto;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  total: number;
  benefitsApplied: string[] | null;
  couponCode: string | null;
  couponLabel: string | null;
  createdAt: number;
  items: OrderItemResponseDto[];
};

export type UpdateOrderStatusRequestDto = {
  status: OrderStatusDto;
  notes?: string | null;
};

export function createOrder(payload: CreateOrderRequestDto, token: string) {
  return request<OrderResponseDto>("/api/v1/orders", {
    method: "POST",
    body: payload,
    token
  });
}

export function fetchMyOrders(token: string) {
  return request<OrderResponseDto[]>("/api/v1/orders/mine", { token });
}

export function fetchAllOrders(token: string) {
  return request<OrderResponseDto[]>("/api/v1/orders", { token });
}

export function updateOrderStatus(orderId: string, payload: UpdateOrderStatusRequestDto, token: string) {
  return request<OrderResponseDto>(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    body: payload,
    token
  });
}
