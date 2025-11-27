export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const DEFAULT_BASE_URL = "http://localhost:8080";

function getBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim().replace(/\/$/, "");
  }
  return DEFAULT_BASE_URL;
}

export async function request<T>(path: string, options: { method?: HttpMethod; body?: unknown; token?: string } = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  if (options.body !== undefined && options.method && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "include"
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let payload: unknown = undefined;
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch (error) {
        // ignore parse errors
      }
    }
    const error = new Error("Solicitud al backend falló");
    (error as any).status = response.status;
    (error as any).payload = payload;
    throw error;
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error("No se pudo interpretar la respuesta JSON");
  }
}
