import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatMoney } from "../utils/format";
import { CommentsSection } from "../components/blog/CommentsSection";

const BDAY_CAKE_ID = "BDAY001";

export function ProductoPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const {
    storefrontProducts,
    addToCart,
    getProductPricing,
    birthdayRewardAvailable,
    birthdayRewardEligible
  } = useAppContext();
  const product = storefrontProducts.find((p) => p.id === productId);

  const [qty, setQty] = useState<number>(1);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [shareMsg, setShareMsg] = useState<string>("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [productId]);

  if (!product) {
    return (
      <div className="container" style={{ padding: "32px 0" }}>
        <p>Este producto no está disponible.</p>
        <button className="btn btn--primary" type="button" onClick={() => navigate("/productos")}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  const isCake = /torta/i.test(product.nombre);
  const isBirthdayProduct = product.id === BDAY_CAKE_ID;
  const maxQty = Math.max(0, isBirthdayProduct ? Math.min(1, product.stock) : product.stock);

  const usesBirthdayCake = isBirthdayProduct && birthdayRewardAvailable;
  const allowsCustomMessage = isCake && product.id !== BDAY_CAKE_ID;

  const unitPricing = useMemo(() => getProductPricing(product, 1), [getProductPricing, product]);
  const hasUserDiscount = unitPricing.discountPerUnit > 0;
  const discountedPrice = usesBirthdayCake ? 0 : unitPricing.unitPrice;
  const displayPrice = discountedPrice === 0 ? "Gratis" : formatMoney(discountedPrice);

  const related = storefrontProducts
    .filter((p) => p.categoria === product.categoria && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (maxQty <= 0) return;
    const safeQty = Math.min(qty, Math.max(1, maxQty));
    const message = allowsCustomMessage ? customMessage.trim() : "";
    addToCart(product.id, safeQty, message);
  };

  const finalUrl = useMemo(() => {
    const base = window.location.origin + `/producto/${encodeURIComponent(product.id)}`;
    const params = new URLSearchParams({
      utm_source: "share",
      utm_medium: "social",
      utm_campaign: "share_product"
    });
    return `${base}?${params.toString()}`;
  }, [product.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      setShareMsg("¡Enlace copiado!");
    } catch (error) {
      console.error(error);
      setShareMsg("No se pudo copiar 😕");
    } finally {
      setTimeout(() => setShareMsg(""), 2000);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${product.nombre} · Mil Sabores`,
          text: product.nombre,
          url: finalUrl
        });
      } else {
        await handleCopy();
        window.open("https://www.instagram.com/", "_blank", "noopener");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container producto">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <span className="sep">/</span>
        <Link to="/productos">Productos</Link>
        {product.categoria && (
          <>
            <span className="sep">/</span>
            <Link to={`/productos#${encodeURIComponent(product.categoria)}`}>{product.categoria}</Link>
          </>
        )}
        <span className="sep">/</span>
        <span>{product.nombre}</span>
      </nav>

      <section className="pdp">
        <div className="pdp__gallery">
          <figure className="pdp__hero">
            <img id="heroImg" src={product.img || "/img/placeholder.png"} alt={product.nombre} />
          </figure>
        </div>

        <div className="pdp__info">
          <h1>{product.nombre}</h1>
          {product.attr && <p className="muted">• {product.attr}</p>}
          <div className="pdp__price">
            {hasUserDiscount && !usesBirthdayCake ? (
              <>
                <s className="muted">{formatMoney(product.precio)}</s>
                <strong>{displayPrice}</strong>
              </>
            ) : (
              <strong>{displayPrice}</strong>
            )}
            {usesBirthdayCake && <span className="badge" style={{ marginLeft: 8 }}>Beneficio cumpleaños</span>}
            {isBirthdayProduct && birthdayRewardEligible && !birthdayRewardAvailable && (
              <span className="badge badge--muted" style={{ marginLeft: 8 }}>Beneficio ya utilizado este año</span>
            )}
          </div>
          <p id="pLong">
            {product.descripcion || "Deliciosa preparación de la casa, ideal para tus celebraciones."}
          </p>
          {usesBirthdayCake && (
            <p className="muted small">
              Beneficio exclusivo: la torta es gratis y el envío se bonifica cuando es el único producto de tu carrito.
            </p>
          )}
          <p id="pStock" className="muted">
            {maxQty > 0 ? `Stock disponible: ${maxQty}` : "Sin stock"}
          </p>

          <div className="pdp__actions">
            <label className="muted" htmlFor="qty">
              Cantidad
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={Math.max(1, maxQty)}
              value={qty}
              onChange={(event) => {
                const rawValue = event.target.value;
                if (!rawValue) {
                  setQty(1);
                  return;
                }
                const parsed = Number.parseInt(rawValue, 10);
                if (Number.isNaN(parsed)) {
                  setQty(1);
                  return;
                }
                const upper = Math.max(1, maxQty);
                const clamped = Math.min(Math.max(1, parsed), upper);
                setQty(clamped);
              }}
              disabled={maxQty <= 0}
            />
          </div>

          {allowsCustomMessage && (
            <div id="customBox" className="pdp__custom">
              <label htmlFor="customMsg">Mensaje para la torta</label>
              <textarea
                id="customMsg"
                rows={3}
                maxLength={120}
                placeholder="Ej: ¡Feliz cumpleaños, Nico!"
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
              />
            </div>
          )}

          <button
            id="addBtn"
            className="btn btn--primary"
            type="button"
            disabled={maxQty <= 0}
            onClick={handleAdd}
          >
            {maxQty > 0 ? "Añadir al carrito" : "Sin stock"}
          </button>

          <div className="share">
            <p className="small muted" id="shareMsg">
              {shareMsg || "Comparte este producto"}
            </p>
            <div className="share__buttons">
              <button className="btn btn--ghost" type="button" onClick={handleShare}>
                Compartir
              </button>
              <button className="btn btn--ghost" type="button" onClick={handleCopy}>
                Copiar enlace
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="product-comments">
        <CommentsSection
<<<<<<< HEAD
          postId={`product:${product.id}`}
=======
          postSlug={`product:${product.id}`}
>>>>>>> master
          title="Opiniones del producto"
          emptyMessage="Sé el primero en contar tu experiencia con este producto."
          placeholder="Cuéntanos cómo te fue con este producto..."
        />
      </section>

      {related.length > 0 && (
        <section className="related" aria-labelledby="relatedTitle">
          <h2 id="relatedTitle" className="section-title">
            También podría interesarte
          </h2>
          <div className="related__grid" id="related">
            {related.map((item) => (
              <article className="tarjeta" key={item.id}>
                <Link className="tarjeta__imagen" to={`/producto/${encodeURIComponent(item.id)}`}>
                  <img src={item.img || "/img/placeholder.png"} alt={item.nombre} loading="lazy" />
                </Link>
                <Link className="tarjeta__titulo" to={`/producto/${encodeURIComponent(item.id)}`}>
                  {item.nombre}
                </Link>
                <p className="tarjeta__atributo">{item.attr || "\u00A0"}</p>
                {(() => {
                  const relPricing = getProductPricing(item, 1);
                  const relHasDiscount = relPricing.discountPerUnit > 0;
                  const relDisplay = relPricing.unitPrice === 0 ? "Gratis" : formatMoney(relPricing.unitPrice);
                  return (
                    <p className="tarjeta__precio">
                      {relHasDiscount ? (
                        <>
                          <s className="muted">{formatMoney(relPricing.originalUnitPrice)}</s>
                          <strong>{relDisplay}</strong>
                        </>
                      ) : (
                        <strong>{relDisplay}</strong>
                      )}
                    </p>
                  );
                })()}
                <Link className="btn btn--fantasma" to={`/producto/${encodeURIComponent(item.id)}`}>
                  Ver detalle
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
