import { request } from "./http";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "active" | "inactive";

export type CustomerAddressDto = {
  id: string;
  alias: string | null;
  direccion: string;
  region: string;
  comuna: string;
  referencia: string | null;
  primary: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CustomerProfileDto = {
  id: string;
  run: string;
  firstName: string;
  lastName: string;
  email: string;
  status: CustomerStatus;
  customerType: string | null;
  birthDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  region: string | null;
  commune: string | null;
  address: string | null;
  phone: string | null;
  promoCode: string | null;
  felices50: boolean;
  birthdayRedeemedYear: number | null;
  defaultShippingCost: number | null;
  newsletter: boolean;
  saveAddress: boolean;
  staffRole: string | null;
  addresses: CustomerAddressDto[];
};

export type CustomerSummaryDto = {
  id: string;
  run: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
  region: string | null;
  commune: string | null;
  address?: string | null;
  phone?: string | null;
  promoCode?: string | null;
  customerType: string | null;
  status: CustomerStatus;
  newsletter: boolean;
  saveAddress?: boolean | null;
  felices50: boolean;
  birthdayRedeemedYear: number | null;
  defaultShippingCost: number | null;
};

export type CustomerAddressRequestDto = {
  id?: string | null;
  alias?: string | null;
  direccion: string;
  region: string;
  comuna: string;
  referencia?: string | null;
  primary?: boolean;
};

export type CustomerRegistrationRequestDto = {
  run: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  customerType?: string | null;
  birthDate?: string | null;
  region?: string | null;
  commune?: string | null;
  address?: string | null;
  phone?: string | null;
  promoCode?: string | null;
  defaultShippingCost?: number | null;
  newsletter?: boolean;
  saveAddress?: boolean;
  birthdayRedeemedYear?: number | null;
  addresses?: CustomerAddressRequestDto[];
};

export type CustomerUpdateRequestDto = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  region?: string | null;
  commune?: string | null;
  address?: string | null;
  phone?: string | null;
  promoCode?: string | null;
  customerType?: string | null;
  birthDate?: string | null;
  birthdayRedeemedYear?: number | null;
  defaultShippingCost?: number | null;
  newsletter?: boolean;
  saveAddress?: boolean;
  felices50?: boolean;
  primaryAddressId?: string | null;
  addresses?: CustomerAddressRequestDto[];
};

export type CustomerStatusRequestDto = {
  status: "ACTIVE" | "INACTIVE" | "active" | "inactive";
};

export function registerCustomer(payload: CustomerRegistrationRequestDto) {
  return request<CustomerProfileDto>("/api/v1/customers/register", {
    method: "POST",
    body: payload
  });
}

export function fetchCurrentCustomer(token: string) {
  return request<CustomerProfileDto>("/api/v1/customers/me", { token });
}

export function updateCurrentCustomer(payload: CustomerUpdateRequestDto, token: string) {
  return request<CustomerProfileDto>("/api/v1/customers/me", {
    method: "PUT",
    body: payload,
    token
  });
}

export function fetchAdminCustomers(token: string) {
  return request<CustomerSummaryDto[]>("/api/v1/admin/customers", { token });
}

export function updateCustomerByAdmin(customerId: string, payload: CustomerUpdateRequestDto, token: string) {
  return request<CustomerSummaryDto>(`/api/v1/admin/customers/${customerId}`, {
    method: "PUT",
    body: payload,
    token
  });
}

export function updateCustomerStatus(customerId: string, payload: CustomerStatusRequestDto, token: string) {
  return request<void>(`/api/v1/admin/customers/${customerId}/status`, {
    method: "PATCH",
    body: payload,
    token
  });
}
