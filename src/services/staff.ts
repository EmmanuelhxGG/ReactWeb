import { request } from "./http";

export type StaffStatus = "ACTIVE" | "INACTIVE" | "active" | "inactive";

export type StaffResponseDto = {
  id: string;
  run: string;
  firstName: string;
  lastName: string;
  email: string;
  staffRole: string | null;
  region: string | null;
  commune: string | null;
  address: string | null;
  phone: string | null;
  status: StaffStatus;
};

export type StaffRequestDto = {
  run: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  staffRole?: string | null;
  region?: string | null;
  commune?: string | null;
  address?: string | null;
  phone?: string | null;
};

export type StaffUpdateRequestDto = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  staffRole?: string | null;
  region?: string | null;
  commune?: string | null;
  address?: string | null;
  phone?: string | null;
  active?: boolean | null;
};

export function fetchStaff(token: string) {
  return request<StaffResponseDto[]>("/api/v1/admin/staff", { token });
}

export function createStaff(payload: StaffRequestDto, token: string) {
  return request<StaffResponseDto>("/api/v1/admin/staff", {
    method: "POST",
    body: payload,
    token
  });
}

export function updateStaff(staffId: string, payload: StaffUpdateRequestDto, token: string) {
  return request<StaffResponseDto>(`/api/v1/admin/staff/${staffId}`, {
    method: "PUT",
    body: payload,
    token
  });
}

export function deleteStaff(staffId: string, token: string) {
  return request<void>(`/api/v1/admin/staff/${staffId}`, {
    method: "DELETE",
    token
  });
}
