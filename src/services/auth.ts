import { request } from "./http";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  expiresAt: number;
  refreshToken: string;
  refreshExpiresAt: number;
  role: string;
  userId: string;
  status: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload
  });
}

export async function refreshAuth(token: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/refresh", {
    method: "POST",
    body: { refreshToken: token }
  });
}

export type { LoginResponse };
