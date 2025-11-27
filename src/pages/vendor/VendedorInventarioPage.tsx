import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { formatMoney } from "../../utils/format";

export function VendedorInventarioPage() {
  const { products } = useAppContext();
  const [filter, setFilter] = useState("");

  const filtered = products.filter((product) => {
    if (!filter.trim()) return true;
    const text = filter.trim().toLowerCase();
    return (
      product.nombre.toLowerCase().includes(text) ||
      product.categoria.toLowerCase().includes(text) ||
      product.id.toLowerCase().includes(text)
    );
  });

  return (
    <section>
      <header className="admin-header">
        <h1 className="admin-title">Inventario</h1>
        <p className="admin-subtitle">Resumen de stock disponible para ventas</p>
      </header>

      <div className="actions-top">
        <input
          type="search"
          placeholder="Buscar productos"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc", minWidth: "240px" }}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Crítico</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>{product.stock}</td>
                <td>{product.stockCritico}</td>
                <td>{formatMoney(product.precio)}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                  No hay resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
