<<<<<<< HEAD
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatMoney } from "../utils/format";
import { BLOG_POSTS } from "../data/blogPosts";
=======
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatMoney } from "../utils/format";
import type { BlogPost } from "../types";
import { fetchBlogSummaries } from "../services/blog";
>>>>>>> master

const FEATURED_IDS = ["TC001", "PSA002", "PSA001"];

export function InicioPage() {
  const { storefrontProducts, getProductPricing } = useAppContext();
  const featured = storefrontProducts.filter((p) => FEATURED_IDS.includes(p.id)).slice(0, 3);
<<<<<<< HEAD
  const [blog1, blog2] = BLOG_POSTS;
=======
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadPosts = async () => {
      try {
        const data = await fetchBlogSummaries();
        if (!active) return;
        setBlogPosts(data.slice(0, 2));
        setBlogError(null);
      } catch (error) {
        console.error("No se pudieron cargar las novedades del blog", error);
        if (!active) return;
        setBlogError("No pudimos cargar las últimas novedades del blog.");
      } finally {
        if (active) {
          setBlogLoading(false);
        }
      }
    };
    void loadPosts();
    return () => {
      active = false;
    };
  }, []);
>>>>>>> master

  return (
    <div className="home">
      <section className="hero-alt">
        <div className="hero-alt__overlay" aria-hidden />
        <div className="container hero-alt__content">
          <h1 className="title-alt">Pastelería Mil Sabores</h1>
          <p className="lead-alt">
            Celebra nuestros 50 años con sabores clásicos y nuevas creaciones.
            Personaliza tu torta y aprovecha descuentos especiales.
          </p>
          <Link className="btn btn--secundario" to="/productos">
            Explora nuestros productos
          </Link>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">Nuestros Productos Estrella</h2>
        <div className="products__grid">
          {featured.map((product) => (
            <article className="product-card" key={product.id}>
              <img
                className="product-card__image"
                src={product.img || "/img/placeholder.png"}
                alt={product.nombre}
                loading="lazy"
              />
              <div className="product-card__info">
                <h3 className="product-card__title">{product.nombre}</h3>
                {(() => {
                  const pricing = getProductPricing(product, 1);
                  const hasDiscount = pricing.discountPerUnit > 0;
                  const displayPrice = pricing.unitPrice === 0 ? "Gratis" : formatMoney(pricing.unitPrice);
                  return (
                    <p className="product-card__price">
                      {hasDiscount ? (
                        <>
                          <s className="muted">{formatMoney(pricing.originalUnitPrice)}</s>
                          <strong>{displayPrice}</strong>
                        </>
                      ) : (
                        <strong>{displayPrice}</strong>
                      )}
                    </p>
                  );
                })()}
                <Link className="btn btn--tertiary" to={`/producto/${product.id}`}>
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="center-btn">
          <Link className="btn btn--primary" to="/productos">
            Ver todos los productos
          </Link>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <h2 className="section-title">Últimas Novedades del Blog</h2>
          <div className="blog__grid">
<<<<<<< HEAD
            {[blog1, blog2].map((post) => (
              <article className="blog-card" key={post.id}>
                <img
                  className="blog-card__image"
                  src={post.hero.image}
                  alt={post.title}
                  loading="lazy"
                />
                <div className="blog-card__content">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link className="link link--read-more" to={`/blog/${post.slug}`}>
                    Leer más
                  </Link>
                </div>
              </article>
            ))}
=======
            {blogLoading && <p className="muted">Cargando novedades…</p>}
            {!blogLoading && blogError && <p className="muted">{blogError}</p>}
            {!blogLoading && !blogError && blogPosts.length === 0 && (
              <p className="muted">Aún no hay publicaciones disponibles.</p>
            )}
            {!blogLoading && !blogError &&
              blogPosts.map((post) => (
                <article className="blog-card" key={post.id}>
                  <img
                    className="blog-card__image"
                    src={post.hero.image || "/img/blog-placeholder.jpg"}
                    alt={post.title}
                    loading="lazy"
                  />
                  <div className="blog-card__content">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <Link className="link link--read-more" to={`/blog/${post.slug}`}>
                      Leer más
                    </Link>
                  </div>
                </article>
              ))}
>>>>>>> master
          </div>
          <div className="center-btn">
            <Link className="btn btn--primary" to="/blog">
              Ir a nuestro blog
            </Link>
          </div>
        </div>
      </section>

      <section className="cta container">
        <h2 className="cta__title">¿Necesitas una torta personalizada?</h2>
        <p className="cta__text">
          ¡Estamos listos para crear el pastel de tus sueños! Contacta a nuestro equipo para pedidos especiales.
        </p>
        <Link className="btn btn--primary" to="/contacto">
          Contáctanos ahora
        </Link>
      </section>
    </div>
  );
}
