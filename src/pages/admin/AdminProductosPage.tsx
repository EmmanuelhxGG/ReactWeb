import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import type { Product } from "../../types";
import { formatMoney } from "../../utils/format";
import { ProductCreateForm } from "../../components/admin/ProductCreateForm";

export function AdminProductosPage() {
  const { products, removeProduct, upsertProduct, showNotification } = useAppContext();
  const [filter, setFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = products.filter((product) => {
    if (!filter.trim()) return true;
    const text = filter.trim().toLowerCase();
    return (
      product.nombre.toLowerCase().includes(text) ||
      product.categoria.toLowerCase().includes(text) ||
      product.id.toLowerCase().includes(text)
    );
  });

  const handleStockUpdate = (product: Product) => {
    showNotification({
      message: `Nuevo stock para ${product.nombre}`,
      kind: "info",
      mode: "dialog",
      actionLabel: "Actualizar",
      cancelLabel: "Cancelar",
      input: {
        label: "Cantidad disponible",
        type: "number",
        defaultValue: String(product.stock),
        min: 0,
        autoFocus: true
      },
      onAction: (value) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
          showNotification({
            message: "Ingresa un número válido",
            kind: "error",
            mode: "dialog",
            actionLabel: "Aceptar"
          });
          return;
        }
        upsertProduct({ ...product, stock: Math.floor(parsed) });
        showNotification({
          message: "Stock actualizado.",
          kind: "success",
          mode: "dialog",
          actionLabel: "Listo"
        });
      }
    });
  };

  const handleRemove = (product: Product) => {
    showNotification({
      message: `¿Deseas eliminar ${product.nombre}?`,
      kind: "info",
      mode: "dialog",
      actionLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onAction: () => {
        removeProduct(product.id);
        showNotification({
          message: `${product.nombre} eliminado.`,
          kind: "success",
          mode: "dialog",
          actionLabel: "Aceptar"
        });
      }
    });
  };

  return (
    <section>
      <div className="actions-top">
        <input
          type="search"
          placeholder="Buscar por nombre, categoría o código"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ccc", minWidth: "240px" }}
        />
        <button
          className="btn btn--principal"
          type="button"
          onClick={() => setIsCreateOpen((prev) => !prev)}
        >
          {isCreateOpen ? "Cerrar formulario" : "Agregar producto nuevo"}
        </button>
      </div>

      {isCreateOpen && (
        <div className="admin-form" style={{ marginBottom: "24px" }}>
          <h2 style={{ marginBottom: "16px" }}>Registrar nuevo producto</h2>
          <ProductCreateForm onCreated={() => setIsCreateOpen(false)} onClose={() => setIsCreateOpen(false)} />
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Crítico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td>{product.stock}</td>
                <td>{formatMoney(product.precio)}</td>
                <td>{product.stockCritico}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" type="button" onClick={() => handleStockUpdate(product)}>
                      Stock
                    </button>
                    <button className="btn-delete" type="button" onClick={() => handleRemove(product)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                  No encontramos productos con ese criterio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
