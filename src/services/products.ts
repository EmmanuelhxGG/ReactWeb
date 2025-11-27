import type { Product } from "../types";
import { request } from "./http";

export type ProductResponse = {
  id: string;
  name: string;
  price: number;
  category: string;
  attributes: string | null;
  imageUrl: string | null;
  stock: number;
  criticalStock: number;
  description: string | null;
  active: boolean;
};

const BDAY_CAKE_ID = "BDAY001";

function mapProduct(response: ProductResponse): Product {
  const image = response.imageUrl ?? "";
  const normalizedImage = image.startsWith("/") ? image : image ? `/${image}` : "/img/placeholder.png";
  const basePrice = response.id === BDAY_CAKE_ID ? 0 : response.price;
  return {
    id: response.id,
    nombre: response.name,
    precio: basePrice,
    categoria: response.category,
    attr: response.attributes ?? "",
    img: normalizedImage,
    stock: response.stock,
    stockCritico: response.criticalStock,
    descripcion: response.description ?? undefined
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await request<ProductResponse[]>("/api/v1/products");
  return data.filter((product) => product.active).map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const data = await request<ProductResponse>(`/api/v1/products/${id}`);
  return mapProduct(data);
}

type ProductPayload = {
  id: string;
  name: string;
  price: number;
  category: string;
  attributes: string | null;
  imageUrl: string | null;
  stock: number;
  criticalStock: number;
  description: string | null;
  active?: boolean;
};

function buildPayload(product: Product): ProductPayload {
  return {
    id: product.id,
    name: product.nombre,
    price: product.precio,
    category: product.categoria,
    attributes: product.attr || null,
    imageUrl: product.img || null,
    stock: product.stock,
    criticalStock: product.stockCritico,
    description: product.descripcion || null,
    active: true
  };
}

export async function createProduct(product: Product, token: string): Promise<Product> {
  const payload = buildPayload(product);
  const response = await request<ProductResponse>("/api/v1/products", {
    method: "POST",
    body: payload,
    token
  });
  return mapProduct(response);
}

export async function updateProduct(product: Product, token: string): Promise<Product> {
  const payload = buildPayload(product);
  const response = await request<ProductResponse>(`/api/v1/products/${product.id}`, {
    method: "PUT",
    body: payload,
    token
  });
  return mapProduct(response);
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  await request<void>(`/api/v1/products/${id}`, {
    method: "DELETE",
    token
  });
}
