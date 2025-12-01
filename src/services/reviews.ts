import type { BlogComment } from "../types";
import { request } from "./http";

type ProductReviewResponse = {
  id: string;
  productId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
};

function mapReview(response: ProductReviewResponse): BlogComment {
  return {
    id: response.id,
    ownerId: response.authorEmail.toLowerCase(),
    authorEmail: response.authorEmail,
    authorName: response.authorName,
    text: response.content,
    ts: new Date(response.createdAt).getTime(),
    editedAt: response.editedAt ? new Date(response.editedAt).getTime() : null
  } satisfies BlogComment;
}

export async function fetchProductReviews(productId: string): Promise<BlogComment[]> {
  const data = await request<ProductReviewResponse[]>(`/api/v1/products/${productId}/reviews`);
  return data.map(mapReview);
}

export async function createProductReview(productId: string, content: string, token: string): Promise<BlogComment> {
  const response = await request<ProductReviewResponse>(`/api/v1/products/${productId}/reviews`, {
    method: "POST",
    body: { content },
    token
  });
  return mapReview(response);
}

export async function updateProductReview(reviewId: string, content: string, token: string): Promise<BlogComment> {
  const response = await request<ProductReviewResponse>(`/api/v1/products/reviews/${reviewId}`, {
    method: "PUT",
    body: { content },
    token
  });
  return mapReview(response);
}

export async function deleteProductReview(reviewId: string, token: string): Promise<void> {
  await request<void>(`/api/v1/products/reviews/${reviewId}`, {
    method: "DELETE",
    token
  });
}
