import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatMoney } from "../../utils/format";

export function VendedorHomePage() {
  const { products, orders } = useAppContext();

  const stats = useMemo(() => {
    const stockTotal = products.reduce((acc, product) => acc + product.stock, 0);
    const lowStock = products.filter((product) => product.stock <= product.stockCritico).length;
    const pendientes = orders.filter((order) => order.estado !== "Entregado");
    const totalPendiente = pendientes.reduce((acc, order) => acc + order.total, 0);
    return { stockTotal, lowStock, pendientes: pendientes.length, totalPendiente };
  }, [products, orders]);

  return (
    <section className="admin-widgets">
      <article className="widget">
        <h3>Inventario disponible</h3>
        <p>
          <strong>{stats.stockTotal}</strong> unidades disponibles.<br />
          {stats.lowStock ? `${stats.lowStock} productos en nivel crítico.` : "Todo en orden."}
        </p>
      </article>

      <article className="widget">
        <h3>Pedidos en curso</h3>
        <p>
          <strong>{stats.pendientes}</strong> pedidos por gestionar.<br />
          Total estimado: <strong>{formatMoney(stats.totalPendiente)}</strong>
        </p>
        <p className="muted">Prioriza la preparación y despacho.</p>
      </article>
    </section>
  );
}
