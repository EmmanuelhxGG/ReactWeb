import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { useAppContext } from "../../context/AppContext";
import { formatMoney } from "../../utils/format";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addToCart, getProductPricing } = useAppContext();
  const pricing = getProductPricing(product, 1);
  const hasDiscount = pricing.discountPerUnit > 0;
  const displayPrice = pricing.unitPrice === 0 ? "Gratis" : formatMoney(pricing.unitPrice);

  return (
    <article className="tarjeta" data-id={product.id}>
      <Link className="tarjeta__imagen" to={`/producto/${encodeURIComponent(product.id)}`} aria-label={product.nombre}>
        <img loading="lazy" src={product.img || "/img/placeholder.png"} alt={product.nombre} />
      </Link>
      <Link className="tarjeta__titulo" to={`/producto/${encodeURIComponent(product.id)}`}>
        {product.nombre}
      </Link>
      <p className="tarjeta__atributo">{product.attr || "\u00A0"}</p>
      <p className="tarjeta__precio">
        {hasDiscount ? (
          <>
            <s className="muted">{formatMoney(pricing.originalUnitPrice)}</s>
            <strong>{displayPrice}</strong>
          </>
        ) : (
          <strong>{displayPrice}</strong>
        )}
      </p>
      <button
        className="btn btn--fantasma boton-a\u00f1adir-carrito"
        type="button"
        onClick={() => addToCart(product.id, 1)}
      >
        Añadir
      </button>
    </article>
  );
}
