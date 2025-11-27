import { Fragment, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { describeBenefitLabel, formatMoney } from "../../utils/format";

const ESTADOS = ["Pendiente", "Preparando", "Despachado", "Entregado"];

export function AdminPedidosPage() {
<<<<<<< HEAD
  const { orders, updateOrders } = useAppContext();
=======
  const { orders, changeOrderStatus, showNotification } = useAppContext();
>>>>>>> master
  const [selected, setSelected] = useState<string | null>(null);

  const resumen = useMemo(() => {
    const total = orders.length;
    const porEstado = ESTADOS.reduce<Record<string, number>>((acc, estado) => {
      acc[estado] = orders.filter((order) => order.estado === estado).length;
      return acc;
    }, {});
    return { total, porEstado };
  }, [orders]);

  const toggleDetalle = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  };

<<<<<<< HEAD
  const cambiarEstado = (id: string, estado: string) => {
    updateOrders(
      orders.map((order) => (order.id === id ? { ...order, estado } : order))
    );
=======
  const cambiarEstado = async (id: string, estado: string) => {
    const result = await changeOrderStatus(id, estado);
    if (!result.ok) {
      showNotification({ message: result.message ?? "No se pudo actualizar el pedido", kind: "error" });
    }
>>>>>>> master
  };

  return (
    <section>
      <div className="admin-widgets" style={{ marginBottom: "24px" }}>
        <article className="widget">
          <h3>Resumen de pedidos</h3>
          <p>Total históricos: <strong>{resumen.total}</strong></p>
          <ul className="muted" style={{ listStyle: "disc", paddingLeft: "20px" }}>
            {ESTADOS.map((estado) => (
              <li key={estado}>
                {estado}: {resumen.porEstado[estado] || 0}
              </li>
            ))}
          </ul>
        </article>
      </div>

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
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() => toggleDetalle(order.id)}
                      >
                        {selected === order.id ? "Ocultar" : "Detalle"}
                      </button>
                      <select
                        value={order.estado}
                        onChange={(event) => cambiarEstado(order.id, event.target.value)}
                        style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
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
                          <div>
                            <strong>Total final: {formatMoney(order.total)}</strong>
                          </div>
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
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
