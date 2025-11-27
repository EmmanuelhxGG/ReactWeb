import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { isEmailAllowed } from "../../utils/validators";

export function Footer() {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    if (!isEmailAllowed(email)) {
      setMessage("Correo permitido: @duoc.cl, profesor.duoc.cl o gmail");
      return;
    }
    setMessage("¡Gracias por suscribirte!");
    form.reset();
  };

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="brand__name brand__name--footer">Mil Sabores</p>
          <nav className="footer__links">
            <Link className="link" to="/productos">Tortas Cuadradas</Link>
            <Link className="link" to="/productos">Tortas Circulares</Link>
            <Link className="link" to="/productos">Sin Azúcar</Link>
            <Link className="link" to="/productos">Veganas</Link>
            <Link className="link" to="/productos">Sin Gluten</Link>
          </nav>
          <div className="pay" aria-label="Medios de pago">
            <span aria-label="Visa">💳</span>
            <span aria-label="Mastercard">💳</span>
            <span aria-label="Transbank">🏦</span>
          </div>
        </div>

        <form className="newsletter" onSubmit={handleSubmit} noValidate>
          <label className="newsletter__label" htmlFor="newsletterEmail">
            Recibe actualizaciones, novedades y promociones.
          </label>
          <div className="newsletter__row">
            <input
              id="newsletterEmail"
              name="email"
              type="email"
              placeholder="Ingresa tu email"
              required
            />
            <button className="btn btn--primary" type="submit">
              Suscribirse
            </button>
          </div>
          <small className="help">{message}</small>
        </form>
      </div>
      <p className="copy">© 2025 Pastelería Mil Sabores</p>
    </footer>
  );
}
