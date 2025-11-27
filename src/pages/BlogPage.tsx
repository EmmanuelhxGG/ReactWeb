import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BlogPost } from "../types";
import { fetchBlogSummaries } from "../services/blog";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchBlogSummaries()
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("No pudimos cargar las noticias del blog.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container contenedor-blog" style={{ padding: "32px 0" }}>
      <h1 className="titulo-principal-blog">Nuestro Blog de Noticias</h1>
      {loading && <p className="muted">Cargando artículos…</p>}
      {error && !loading && <p className="muted">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="muted">Aún no hay artículos publicados.</p>
      )}
      {posts.map((post, index) => (
        <section key={post.id} className={`articulo-blog articulo-blog--${index + 1}`}>
          <div className="contenido-blog">
            <h2 className="titulo-articulo font-brand">CASO CURIOSO #{index + 1}</h2>
            <p className="resumen-articulo">{post.excerpt}</p>
            <Link className="btn btn--principal" to={`/blog/${post.slug}`}>
              Leer más
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
