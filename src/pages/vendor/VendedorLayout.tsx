import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const SELLER_ROLES = new Set(["Inventario", "Ventas", "Vendedor"]);

export function VendedorLayout() {
  const { adminSession } = useAppContext();

  const canAccess = adminSession && SELLER_ROLES.has(adminSession.rol);
  if (!canAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h1 className="sidebar__title">Mil Sabores</h1>
        <nav className="sidebar__nav">
          <NavLink to="/vendedor" end className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Inicio
          </NavLink>
          <NavLink to="/vendedor/inventario" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Inventario
          </NavLink>
          <NavLink to="/vendedor/pedidos" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Pedidos
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
