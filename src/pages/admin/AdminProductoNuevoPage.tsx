import { useNavigate } from "react-router-dom";
import { ProductCreateForm } from "../../components/admin/ProductCreateForm";

export function AdminProductoNuevoPage() {
  const navigate = useNavigate();

  return (
    <section className="admin-form">
      <h2 style={{ marginBottom: "16px" }}>Registrar nuevo producto</h2>
      <ProductCreateForm
        onCreated={() => navigate("/admin/productos", { replace: true })}
        onClose={() => navigate("/admin/productos")}
      />
    </section>
  );
}
