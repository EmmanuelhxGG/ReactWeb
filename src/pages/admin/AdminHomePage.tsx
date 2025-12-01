import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatMoney } from "../../utils/format";

export function AdminHomePage() {
  const { products, customers, orders } = useAppContext();

  const stats = useMemo(() => {
    const productCount = products.length;
    const lowStock = products.filter((item) => item.stock <= item.stockCritico).length;
    const activeCustomers = customers.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const pendingOrders = orders.filter((order) => order.estado !== "Entregado").length;

    const topProduct = [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 1)
      .map((item) => item.nombre)
      .join(", ");

    return {
      productCount,
      lowStock,
      activeCustomers,
      totalRevenue,
      pendingOrders,
      topProduct
    };
  }, [products, customers, orders]);

  return (
    <section className="admin-widgets">
      <article className="widget">
        <h3>Inventario</h3>
        <p>
          <strong>{stats.productCount}</strong> productos registrados.<br />
          {stats.lowStock ? `${stats.lowStock} productos en stock crítico.` : "Inventario estable."}
        </p>
        <p className="muted">{stats.topProduct ? `Mayor disponibilidad: ${stats.topProduct}` : "Agrega más productos para comenzar."}</p>
      </article>

      <article className="widget">
        <h3>Clientes</h3>
        <p>
          <strong>{stats.activeCustomers}</strong> cuentas registradas.<br />
          Revisa el detalle en la sección de usuarios.
        </p>
        <p className="muted">Mantén actualizadas las promociones y los beneficios.</p>
      </article>

      <article className="widget">
        <h3>Ventas</h3>
        <p>
          Total histórico: <strong>{formatMoney(stats.totalRevenue)}</strong>.<br />
          Pedidos pendientes: <strong>{stats.pendingOrders}</strong>.
        </p>
        <p className="muted">Gestiona entregas desde la sección de pedidos.</p>
      </article>
    </section>
  );
}
