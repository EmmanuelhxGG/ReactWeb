import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CommentsSection } from "../components/blog/CommentsSection";
import { useAppContext } from "../context/AppContext";
import { fetchBlogPost } from "../services/blog";
import type { BlogPost } from "../types";

function renderBlock(block: BlogPost["body"][number], index: number) {
  if (block.type === "p") {
    return (
      <p key={index} className="blog-paragraph">
        {block.content as string}
      </p>
    );
  }
  if (block.type === "heading") {
    return (
      <h2 key={index} className="blog-subtitle font-brand">
        {block.content as string}
      </h2>
    );
  }
  if (block.type === "list") {
    return (
      <ul key={index} className="blog-list">
        {(block.content as string[]).map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }
  return null;
}

export function BlogDetallePage() {
  const { slug } = useParams();
  const { hydrateComments } = useAppContext();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setError("Artículo no encontrado");
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    fetchBlogPost(slug)
      .then(({ post: entry, comments }) => {
        if (!isMounted) return;
        setPost(entry);
        hydrateComments(entry.slug, comments);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setPost(null);
        setError("Es posible que el artículo haya sido movido o eliminado.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [slug, hydrateComments]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "48px 0" }}>
        <p className="muted">Cargando artículo…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ padding: "48px 0" }}>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <h1 className="font-brand">Artículo no encontrado</h1>
          <p className="muted">{error}</p>
          <Link className="btn btn--principal" to="/blog">
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="blog-detail container" style={{ padding: "32px 0 48px" }}>
      <Link className="link" to="/blog">
        ← Volver al blog
      </Link>
      <header className="blog-hero" style={{ marginTop: "12px" }}>
        <h1 className="titulo-principal-blog font-brand">{post.title}</h1>
        {post.hero && (
          <figure className="blog-hero__figure">
            <img src={post.hero.image} alt={post.hero.caption} className="blog-hero__image" />
            <figcaption className="muted small">{post.hero.caption}</figcaption>
          </figure>
        )}
        <p className="blog-excerpt">{post.excerpt}</p>
      </header>

      <div className="blog-body" style={{ marginTop: "24px" }}>
        {post.body.map((block, index) => renderBlock(block, index))}
      </div>

      <CommentsSection postSlug={post.slug} />
    </article>
  );
}
