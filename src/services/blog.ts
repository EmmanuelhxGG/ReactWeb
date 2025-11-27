import type { BlogComment, BlogPost } from "../types";
import { request } from "./http";

type BlogHeroResponse = {
  image: string | null;
  caption: string | null;
};

type BlogContentBlockResponse = {
  type: string;
  content: string | null;
  items: string[] | null;
};

type BlogCommentResponse = {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
};

type BlogPostSummaryResponse = {
  id: string;
  slug: string;
  title: string;
  hero: BlogHeroResponse;
  excerpt: string;
};

type BlogPostDetailResponse = BlogPostSummaryResponse & {
  body: BlogContentBlockResponse[];
  comments: BlogCommentResponse[];
};

function buildBody(blocks: BlogContentBlockResponse[]): BlogPost["body"] {
  return blocks.map((block) => {
    if (Array.isArray(block.items) && block.items.length) {
      return {
        type: "list" as const,
        content: block.items
      };
    }
    const text = block.content ?? "";
    if (block.type === "heading") {
      return { type: "heading" as const, content: text };
    }
    return { type: "p" as const, content: text };
  });
}

function mapSummary(entry: BlogPostSummaryResponse): BlogPost {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    hero: {
      image: entry.hero.image ?? "",
      caption: entry.hero.caption ?? ""
    },
    excerpt: entry.excerpt,
    body: []
  } satisfies BlogPost;
}

export async function fetchBlogSummaries(): Promise<BlogPost[]> {
  const data = await request<BlogPostSummaryResponse[]>("/api/v1/blog/posts");
  return data.map(mapSummary);
}

export async function fetchBlogPost(slug: string): Promise<{ post: BlogPost; comments: BlogComment[] }> {
  const data = await request<BlogPostDetailResponse>(`/api/v1/blog/posts/${slug}`);
  const body = buildBody(data.body);
  const post: BlogPost = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    hero: {
      image: data.hero?.image ?? "",
      caption: data.hero?.caption ?? ""
    },
    excerpt: data.excerpt,
    body
  } satisfies BlogPost;
  const comments: BlogComment[] = data.comments.map((comment) => ({
    id: comment.id,
    ownerId: comment.authorEmail.toLowerCase(),
    authorEmail: comment.authorEmail,
    authorName: comment.authorName,
    text: comment.content,
    ts: new Date(comment.createdAt).getTime(),
    editedAt: comment.editedAt ? new Date(comment.editedAt).getTime() : null
  }));
  return { post, comments };
}

export async function createBlogComment(slug: string, content: string, token: string): Promise<BlogComment> {
  const response = await request<BlogCommentResponse>(`/api/v1/blog/posts/${slug}/comments`, {
    method: "POST",
    body: { content },
    token
  });
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

export async function updateBlogComment(commentId: string, content: string, token: string): Promise<BlogComment> {
  const response = await request<BlogCommentResponse>(`/api/v1/blog/comments/${commentId}`, {
    method: "PUT",
    body: { content },
    token
  });
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

export async function deleteBlogComment(commentId: string, token: string): Promise<void> {
  await request<void>(`/api/v1/blog/comments/${commentId}`, {
    method: "DELETE",
    token
  });
}
