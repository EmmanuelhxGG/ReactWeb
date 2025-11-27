import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/layout/Layout";
import { InicioPage } from "./pages/InicioPage";
import { ProductosPage } from "./pages/ProductosPage";
import { ProductoPage } from "./pages/ProductoPage";
import { CarritoPage } from "./pages/CarritoPage";
import { ContactoPage } from "./pages/ContactoPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogDetallePage } from "./pages/BlogDetallePage";
import { NosotrosPage } from "./pages/NosotrosPage";
import { LoginPage } from "./pages/LoginPage";
import { RegistroPage } from "./pages/RegistroPage";
import { PerfilPage } from "./pages/PerfilPage";
<<<<<<< HEAD
=======
import { RequireCustomer } from "./routes/RequireCustomer";
import { RequireAdmin } from "./routes/RequireAdmin";
>>>>>>> master
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminProductosPage } from "./pages/admin/AdminProductosPage";
import { AdminUsuariosPage } from "./pages/admin/AdminUsuariosPage";
import { AdminUsuariosNuevoPage } from "./pages/admin/AdminUsuariosNuevoPage";
import { AdminPedidosPage } from "./pages/admin/AdminPedidosPage";
import { VendedorLayout } from "./pages/vendor/VendedorLayout";
import { VendedorHomePage } from "./pages/vendor/VendedorHomePage";
import { VendedorInventarioPage } from "./pages/vendor/VendedorInventarioPage";
import { VendedorPedidosPage } from "./pages/vendor/VendedorPedidosPage";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<InicioPage />} />
            <Route path="/" element={<InicioPage />} />
            <Route path="productos" element={<ProductosPage />} />
            <Route path="producto/:productId" element={<ProductoPage />} />
            <Route path="carrito" element={<CarritoPage />} />
            <Route path="contacto" element={<ContactoPage />} />
            <Route path="nosotros" element={<NosotrosPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogDetallePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="registro" element={<RegistroPage />} />
<<<<<<< HEAD
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
=======
            <Route
              path="perfil"
              element={(
                <RequireCustomer>
                  <PerfilPage />
                </RequireCustomer>
              )}
            />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route
              path="admin"
              element={(
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              )}
            >
>>>>>>> master
              <Route index element={<AdminHomePage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="producto-nuevo" element={<Navigate to="/admin/productos" replace />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
              <Route path="usuario-nuevo" element={<AdminUsuariosNuevoPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
            </Route>
<<<<<<< HEAD
            <Route path="vendedor" element={<VendedorLayout />}>
=======
            <Route
              path="vendedor"
              element={(
                <RequireAdmin allowRoles={["Inventario", "Ventas", "Vendedor"]}>
                  <VendedorLayout />
                </RequireAdmin>
              )}
            >
>>>>>>> master
              <Route index element={<VendedorHomePage />} />
              <Route path="inventario" element={<VendedorInventarioPage />} />
              <Route path="pedidos" element={<VendedorPedidosPage />} />
            </Route>
            <Route
              path="*"
              element={
                <div className="container" style={{ padding: "48px 0" }}>
                  <div className="card" style={{ padding: "32px", textAlign: "center" }}>
                    <h1 className="font-brand">Página no encontrada</h1>
                    <p className="muted">La página que buscas no existe o fue movida.</p>
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
