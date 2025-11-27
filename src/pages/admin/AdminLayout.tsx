import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function AdminLayout() {
  const { adminSession, adminLogout } = useAppContext();

  if (!adminSession) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h1 className="sidebar__title">Mil Sabores</h1>
        <nav className="sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Inicio
          </NavLink>
          <NavLink to="/admin/productos" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Productos
          </NavLink>
          <NavLink to="/admin/usuarios" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Clientes & Admin
          </NavLink>
          <NavLink to="/admin/usuario-nuevo" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Usuario nuevo
          </NavLink>
          <NavLink to="/admin/pedidos" className={({ isActive }) => `sidebar__link${isActive ? " active" : ""}`}>
            Pedidos
          </NavLink>
        </nav>
        <button className="sidebar__link logout" type="button" onClick={adminLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="admin-header">
          <h1 className="admin-title">Panel administrativo</h1>
          <p className="admin-subtitle">Gestión centralizada — Sesión iniciada como {adminSession.nombre || "Administrador"}</p>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
