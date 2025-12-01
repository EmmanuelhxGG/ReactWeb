import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/productos", label: "Productos" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" }
];

export function Header() {
  const navigate = useNavigate();
  const { cartTotals, customerSession, logoutCustomer } = useAppContext();
  const totalQty = cartTotals.totalQty;
  const firstName = (customerSession?.nombre || "").split(" ")[0] || customerSession?.email || "";

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <div className="brand">
          <span className="brand__dot" aria-hidden />
          <Link className="brand__name" to="/">
            Mil Sabores
          </Link>
        </div>

        <nav className="nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }: { isActive: boolean }) =>
                `nav__link${isActive ? " nav__link--active" : ""}`
              }
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="actions">
          {customerSession ? (
            <>
              <span className="small muted">👋 Hola, {firstName}</span>
              <Link className="link" to="/perfil">
                Mi perfil
              </Link>
              <button
                type="button"
                className="link"
                onClick={() => {
                  logoutCustomer();
                  navigate("/");
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="link" to="/login">
                Iniciar sesión
              </Link>
              <Link className="link" to="/registro">
                Registrarse
              </Link>
            </>
          )}
          <Link id="cartBtn" className="cart" to="/carrito" aria-label="Carrito">
            <span role="img" aria-hidden>
              🛒
            </span>{" "}
            <span id="cartCount">{totalQty}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
