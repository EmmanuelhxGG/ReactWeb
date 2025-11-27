import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { formatMoney } from "../utils/format";
import type { CreateOrderItemRequestDto, CreateOrderRequestDto } from "../services/orders";

const SHIPPING_OPTIONS = [
  { value: 3000, label: "Envío urbano ($3.000)" },
  { value: 6000, label: "Envío regional ($6.000)" }
];

type AddressOption = {
  id: string;
  label: string;
  direccion: string;
  region: string;
  comuna: string;
  referencia?: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CarritoPage() {
  const {
    cartTotals,
    removeFromCart,
    setCartQty,
    clearCart,
    shippingCost,
    setShippingCost,
    coupon,
    setCoupon,
    evaluateCoupon,
    benefitsForCart,
    customerSession,
    currentCustomer,
    updateCustomer,
    openReceiptWindow,
    showNotification,
    placeOrder
  } = useAppContext();

  const { items, subTotal, effectiveSubtotal } = cartTotals;
  const isCartEmpty = items.length === 0;

  const addressOptions = useMemo<AddressOption[]>(() => {
    if (!currentCustomer) return [];
    const stored = currentCustomer.prefs?.addresses;
    if (stored && stored.length) {
      return stored.map((address) => ({
        id: address.id,
        label: address.alias?.trim() || address.direccion,
        direccion: address.direccion,
        region: address.region,
        comuna: address.comuna,
        referencia: address.referencia?.trim() || undefined
      }));
    }
    if (currentCustomer.direccion && currentCustomer.region && currentCustomer.comuna) {
      return [
        {
          id: currentCustomer.prefs?.primaryAddressId || `legacy-${currentCustomer.run}`,
          label: "Dirección registrada",
          direccion: currentCustomer.direccion,
          region: currentCustomer.region,
          comuna: currentCustomer.comuna
        }
      ];
    }
    return [];
  }, [currentCustomer]);

  const primaryId = currentCustomer?.prefs?.primaryAddressId;
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  useEffect(() => {
    if (!addressOptions.length) {
      setSelectedAddressId("");
      return;
    }
    const fallbackId = primaryId && addressOptions.some((option) => option.id === primaryId)
      ? primaryId
      : addressOptions[0]?.id || "";
    setSelectedAddressId((prev) => (prev === fallbackId ? prev : fallbackId));
  }, [addressOptions, primaryId]);

  const selectedAddress = useMemo(
    () => addressOptions.find((option) => option.id === selectedAddressId) || null,
    [addressOptions, selectedAddressId]
  );

  const benefits = useMemo(() => benefitsForCart(items, subTotal), [benefitsForCart, items, subTotal]);
  const baseAfterBenefits = Math.max(0, subTotal - benefits.bdayDisc - benefits.userDisc);
  const shipBeforeCoupons = benefits.freeShipping ? 0 : shippingCost;
  const couponInfo = evaluateCoupon(baseAfterBenefits, shipBeforeCoupons);
  const effectiveShip = benefits.freeShipping
    ? 0
    : couponInfo.valid
      ? couponInfo.shipAfter
      : shipBeforeCoupons;
  const total = Math.max(0, baseAfterBenefits - (couponInfo.valid ? couponInfo.discount : 0) + effectiveShip);

  const handleShipChange = (value: number) => {
    if (benefits.freeShipping) return;
    setShippingCost(value);
    if (currentCustomer && currentCustomer.prefs?.defaultShip !== value) {
      void updateCustomer({ prefs: { defaultShip: value } });
    }
  };

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (!currentCustomer) return;
    void updateCustomer({
      prefs: { primaryAddressId: id }
    });
  };

  const handleCheckout = async () => {
    if (!items.length) return;
    if (!customerSession) {
      showNotification({
        message: "Debes iniciar sesión para finalizar tu compra.",
        kind: "error",
        mode: "dialog",
        actionLabel: "Ir a iniciar sesión",
        onAction: () => {
          window.location.href = "/login";
        }
      });
      return;
    }
    if (!selectedAddressId) {
      showNotification({
        message: "Selecciona una dirección de envío desde tu perfil.",
        kind: "error",
        mode: "dialog",
        actionLabel: "Entendido"
      });
      return;
    }
    const accountStatus = currentCustomer?.status || customerSession?.status;
    if (accountStatus === "inactive") {
      showNotification({
        message: "Tu cuenta está desactivada. No puedes completar compras.",
        kind: "error",
        mode: "dialog",
        actionLabel: "Entendido"
      });
      return;
    }

    const benefitList: string[] = [];
    if (benefits.userDisc > 0 && benefits.userLabel) {
      benefitList.push(benefits.userLabel);
    }
    if (benefits.bdayDisc > 0 && benefits.bdayLabel) {
      benefitList.push(benefits.bdayLabel);
    }
    if (benefits.freeShipping && benefits.shippingLabel) {
      benefitList.push(benefits.shippingLabel);
    }
    if (couponInfo.valid) {
      benefitList.push(couponInfo.label || `Cupón ${couponInfo.code}`);
    }

    const orderItems: CreateOrderItemRequestDto[] = items.map((entry) => {
      const labels: string[] = [];
      if (entry.pricing.discountPerUnit > 0 && benefits.userLabel) {
        labels.push(benefits.userLabel);
      }
      if (entry.product.id === "BDAY001" && benefits.bdayApplied && benefits.bdayLabel) {
        labels.push(benefits.bdayLabel);
      }
      return {
        productId: entry.product.id,
        quantity: entry.qty,
        unitPrice: entry.pricing.unitPrice,
        originalUnitPrice: entry.pricing.originalUnitPrice,
        discountPerUnit: entry.pricing.discountPerUnit,
        benefitLabels: labels.length ? Array.from(new Set(labels)) : null,
        note: entry.msg ? entry.msg : null
      } satisfies CreateOrderItemRequestDto;
    });

    const request: CreateOrderRequestDto = {
      items: orderItems,
      shippingCost: effectiveShip,
      benefitsApplied: benefitList.length ? Array.from(new Set(benefitList)) : null,
      couponCode: couponInfo.valid ? couponInfo.code ?? null : undefined,
      couponLabel: couponInfo.valid ? couponInfo.label ?? null : undefined,
      notes: null,
      shippingAddressId: UUID_PATTERN.test(selectedAddressId) ? selectedAddressId : null
    };

    const result = await placeOrder(request);
    if (!result.ok || !result.order) {
      showNotification({ message: result.message ?? "No pudimos crear tu pedido", kind: "error" });
      return;
    }

    openReceiptWindow(result.order);

    if (benefits.bdayApplied) {
      const currentYear = new Date().getFullYear();
      void updateCustomer({ bdayRedeemedYear: currentYear });
    }

    clearCart();
    setCoupon("");
    showNotification({ message: "Pedido registrado con éxito", kind: "success" });
  };

  return (
    <div className="container" id="cartPage">
      <div className="cart-layout">
        <section>
          {isCartEmpty ? (
            <div className="cart-empty">
              <p className="cart-empty__title">Tu carrito está vacío.</p>
              <p className="muted small">Puedes seguir explorando nuestros productos y volver cuando quieras.</p>
              <Link className="btn btn--primary" to="/productos">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th className="w-50">Producto</th>
                  <th className="ta-right">Precio</th>
                  <th className="ta-center">Cant.</th>
                  <th className="ta-right">Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                const hasDiscount = item.pricing.discountPerUnit > 0;
                const displayUnit = item.pricing.unitPrice;
                const originalUnit = item.pricing.originalUnitPrice;
                const originalSubtotal = item.subtotal;
                const finalSubtotal = item.pricing.total;
                const maxPerItem = Math.max(1, item.product.stock);
                return (
                  <tr key={`${item.product.id}-${item.msg || ""}`}>
                  <td>
                    <div className="cart-prodname">{item.product.nombre}</div>
                    <small className="muted">
                      {item.product.categoria}
                      {item.product.attr ? ` • ${item.product.attr}` : ""}
                    </small>
                    {item.msg && <div className="small muted">🎂 Mensaje: {item.msg}</div>}
                  </td>
                  <td className="ta-right">
                    {hasDiscount ? (
                      <>
                        <s className="muted">{formatMoney(originalUnit)}</s>
                        <div><strong>{formatMoney(displayUnit)}</strong></div>
                      </>
                    ) : (
                      <strong>{formatMoney(displayUnit)}</strong>
                    )}
                  </td>
                  <td className="ta-center">
                    <input
                      className="qty-input"
                      type="number"
                      min={1}
                      max={maxPerItem}
                      value={item.qty}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        const parsed = Number.parseInt(rawValue, 10);
                        const clamped = (() => {
                          if (Number.isNaN(parsed)) return 1;
                          return Math.min(Math.max(1, parsed), maxPerItem);
                        })();
                        setCartQty(item.product.id, clamped, item.msg);
                      }}
                    />
                  </td>
                  <td className="ta-right">
                    {hasDiscount ? (
                      <>
                        <s className="muted">{formatMoney(originalSubtotal)}</s>
                        <div><strong>{formatMoney(finalSubtotal)}</strong></div>
                      </>
                    ) : (
                      <strong>{formatMoney(finalSubtotal)}</strong>
                    )}
                  </td>
                  <td className="ta-right">
                    <button
                      className="btn btn--ghost btn-sm"
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.msg)}
                    >
                      Eliminar
                    </button>
                  </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button className="btn btn--ghost" type="button" onClick={clearCart} disabled={isCartEmpty}>
              Vaciar carrito
            </button>
            <Link className="btn btn--primary" to="/productos">
              Seguir comprando
            </Link>
          </div>
        </section>

        <aside className="cart-summary" data-cart-summary>
          <h3>Total del carrito</h3>
          {customerSession && (
            <div className="sum-row">
              <span className="small muted">Sesión</span>
              <strong className="small">{customerSession.email}</strong>
            </div>
          )}
          {!customerSession && (
            <div className="guest-checkout">
              <h4 className="guest-checkout__title">Inicia sesión para comprar</h4>
              <p className="muted small">
                Necesitas una cuenta para finalizar tu pedido. {" "}
                <Link to="/login">Inicia sesión</Link> o {" "}
                <Link to="/registro">crea una cuenta</Link> en segundos.
              </p>
              <p className="muted small" style={{ marginTop: "8px" }}>
                Si ya estás registrado con correo DUOC, aprovecha tu beneficio de cumpleaños.
              </p>
            </div>
          )}

          <div className="sum-row">
            <span>Subtotal</span>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              {benefits.userDisc > 0 ? (
                <>
                  <s className="muted">{formatMoney(subTotal)}</s>
                  <div id="sum-sub"><strong>{formatMoney(effectiveSubtotal)}</strong></div>
                </>
              ) : (
                <strong id="sum-sub">{formatMoney(subTotal)}</strong>
              )}
            </div>
          </div>
          {benefits.bdayDisc > 0 && (
            <div className="sum-row">
              <span>{benefits.bdayLabel}</span>
              <strong>- {formatMoney(benefits.bdayDisc)}</strong>
            </div>
          )}
          {benefits.userDisc > 0 && (
            <div className="sum-row">
              <span>{benefits.userLabel}</span>
              <strong>- {formatMoney(benefits.userDisc)}</strong>
            </div>
          )}

          <div className="sum-row">
            <label htmlFor="shipping">Envío</label>
            {benefits.freeShipping ? (
              <>
                <span className="muted small">
                  {benefits.shippingLabel || "Beneficio aplicado"}
                </span>
                <strong style={{ marginLeft: "auto" }}>{formatMoney(0)}</strong>
              </>
            ) : (
              <>
                <select
                  id="shipping"
                  className="input"
                  value={shippingCost}
                  onChange={(event) => handleShipChange(Number(event.target.value))}
                  disabled={couponInfo.valid && couponInfo.code === "ENVIOGRATIS"}
                >
                  {SHIPPING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <strong style={{ marginLeft: "auto" }}>{formatMoney(effectiveShip)}</strong>
              </>
            )}
          </div>

          <div className="address-summary">
            <div className="address-summary__header">
              <span>Dirección de entrega</span>
              {currentCustomer && addressOptions.length > 1 && (
                <span className="muted small">{addressOptions.length} guardadas</span>
              )}
            </div>
            {currentCustomer ? (
              <>
                {addressOptions.length > 1 && (
                  <select
                    className="input"
                    value={selectedAddressId}
                    onChange={(event) => handleAddressChange(event.target.value)}
                  >
                    {addressOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="address-summary__body">
                  {selectedAddress ? (
                    <>
                      <div>{selectedAddress.direccion}</div>
                      <div className="muted small">
                        {selectedAddress.comuna}, {selectedAddress.region}
                      </div>
                      {selectedAddress.referencia && (
                        <div className="muted small">Referencia: {selectedAddress.referencia}</div>
                      )}
                    </>
                  ) : (
                    <div className="muted small">Agrega direcciones desde tu perfil.</div>
                  )}
                </div>
                <Link className="address-summary__link" to="/perfil">
                  Administrar direcciones
                </Link>
              </>
            ) : (
              <div className="address-summary__body muted small">
                Inicia sesión para guardar y reutilizar tus direcciones.
              </div>
            )}
          </div>

          <div className="coupon-box">
            <label className="coupon-label" htmlFor="couponInput">
              Ingrese el cupón de descuento
            </label>
            <div className="coupon-row">
              <input
                id="couponInput"
                className="coupon-input"
                type="text"
                placeholder="Ej: ENVIOGRATIS, 5000OFF"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
              />
              <button className="coupon-btn" type="button" onClick={() => setCoupon(coupon)}>
                {couponInfo.valid ? "REAPLICAR" : "APLICAR"}
              </button>
              {couponInfo.valid && (
                <button
                  className="coupon-btn"
                  type="button"
                  style={{ marginLeft: "6px", background: "#eee", color: "#333" }}
                  onClick={() => setCoupon("")}
                >
                  Quitar
                </button>
              )}
            </div>
            <small id="couponMsg" className="muted">
              {couponInfo.valid ? "Cupón aplicado" : "Puedes usar ENVIOGRATIS o 5000OFF"}
            </small>
          </div>

          <div className="sum-row total">
            <span>Total</span>
            <strong id="sum-total">{formatMoney(total)}</strong>
          </div>

          <button
            className="btn btn--primary btn-block"
            type="button"
            onClick={handleCheckout}
            disabled={isCartEmpty || !customerSession || !selectedAddress}
          >
            Finalizar compra
          </button>
          <p className="muted small">* No procesa pago real.</p>
        </aside>
      </div>
    </div>
  );
}
