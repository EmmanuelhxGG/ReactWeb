import { Fragment, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { describeBenefitLabel, formatMoney } from "../../utils/format";

const ESTADOS = ["Pendiente", "Preparando", "Despachado", "Entregado"];

export function VendedorPedidosPage() {
  const { orders, updateOrders, showNotification } = useAppContext();
  const [selected, setSelected] = useState<string | null>(null);

  const toggleDetail = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  };

  const advanceStatus = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    const currentIndex = ESTADOS.indexOf(order.estado);
    const nextEstado = ESTADOS[currentIndex + 1] || ESTADOS[currentIndex];
    if (nextEstado === order.estado) {
      showNotification({
        message: "Este pedido ya está entregado.",
        kind: "info",
        mode: "dialog",
        actionLabel: "Entendido"
      });
      return;
    }
    updateOrders(
      orders.map((item) => (item.id === id ? { ...item, estado: nextEstado } : item))
    );
  };

  return (
    <section>
      <header className="admin-header">
        <h1 className="admin-title">Gestión de pedidos</h1>
        <p className="admin-subtitle">Actualiza estados y revisa detalle de productos</p>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr>
                  <td>{order.id}</td>
                  <td>{order.cliente}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td>{order.estado}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" type="button" onClick={() => toggleDetail(order.id)}>
                        {selected === order.id ? "Ocultar" : "Detalle"}
                      </button>
                      <button className="btn-edit" type="button" onClick={() => advanceStatus(order.id)}>
                        Avanzar estado
                      </button>
                    </div>
                  </td>
                </tr>
                {selected === order.id && (
                  <tr>
                    <td colSpan={5}>
                      <div style={{ background: "#fafafa", padding: "16px", borderRadius: "8px" }}>
                        <h4>Ítems</h4>
                        <ul style={{ paddingLeft: "20px" }}>
                          {order.items.map((item) => {
                            const totalDiscount = Math.max(0, item.originalSubtotal - item.subtotal);
                            const percent = item.originalUnitPrice > 0
                              ? Math.round((item.discountPerUnit / item.originalUnitPrice) * 100)
                              : 0;
                            return (
                              <li key={`${order.id}-${item.codigo}`} style={{ marginBottom: "16px" }}>
                                <div>
                                  <strong>{item.nombre}</strong> — Cant. {item.qty}
                                </div>
                                <div className="muted small">
                                  Precio unitario original: {formatMoney(item.originalUnitPrice)}
                                </div>
                                {totalDiscount > 0 ? (
                                  <div className="muted small">
                                    Descuento aplicado: {percent > 0 ? `${percent}% ` : ""}(–{formatMoney(totalDiscount)})
                                  </div>
                                ) : (
                                  <div className="muted small">Descuento aplicado: No registra</div>
                                )}
                                <div className="muted small">
                                  Subtotal con descuento: {formatMoney(item.subtotal)}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="muted small" style={{ marginTop: "12px" }}>
                          <div>Fecha del pedido: {new Date(order.createdAt).toLocaleString("es-CL", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}</div>
                          <div>Subtotal productos: {formatMoney(order.subtotal)}</div>
                          {order.discountTotal > 0 && (
                            <div>Descuentos total aplicados: -{formatMoney(order.discountTotal)}</div>
                          )}
                          <div>Envío: {formatMoney(order.shippingCost)}</div>
                          <div><strong>Total final: {formatMoney(order.total)}</strong></div>
                          {(order.benefitsApplied?.length || order.couponCode) ? (
                            <div style={{ marginTop: "10px" }}>
                              <div style={{ fontWeight: 600 }}>Motivos del descuento</div>
                              <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                                {order.benefitsApplied?.map((label) => {
                                  const detail = describeBenefitLabel(label);
                                  return (
                                    <li key={`${order.id}-${label}`}>
                                      {detail.title}
                                      {detail.detail ? ` — ${detail.detail}` : ""}
                                    </li>
                                  );
                                })}
                                {order.couponCode ? (
                                  <li key={`${order.id}-coupon`}>
                                    Cupón {order.couponCode}
                                    {order.couponLabel ? ` — ${order.couponLabel}` : ""}
                                  </li>
                                ) : null}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "24px" }}>
                  No hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
