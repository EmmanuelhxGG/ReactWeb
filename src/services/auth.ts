import { request } from "./http";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  expiresAt: number;
  role: string;
  userId: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload
  });
}
