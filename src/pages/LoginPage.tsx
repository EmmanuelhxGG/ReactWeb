import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { isEmailAllowed } from "../utils/validators";

type LoginMode = "customer" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginCustomer, customerSession, adminLogin, showNotification } = useAppContext();
  const [mode, setMode] = useState<LoginMode>("customer");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminErrors, setAdminErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (customerSession) {
      navigate("/perfil", { replace: true });
    }
  }, [customerSession, navigate]);

<<<<<<< HEAD
  const handleCustomerSubmit = (event: FormEvent<HTMLFormElement>) => {
=======
  const handleCustomerSubmit = async (event: FormEvent<HTMLFormElement>) => {
>>>>>>> master
    event.preventDefault();
    const nextErrors: typeof errors = {};

    const trimmed = email.trim();
    if (!trimmed) {
      nextErrors.email = "Ingresa tu correo.";
    } else if (trimmed.length > 100 || !isEmailAllowed(trimmed)) {
      nextErrors.email = "Usa un correo permitido (duoc.cl, profesor.duoc.cl o gmail).";
    }

    if (!password.trim()) {
      nextErrors.password = "Ingresa tu contraseña.";
    } else if (password.length < 4 || password.length > 10) {
      nextErrors.password = "Debe tener entre 4 y 10 caracteres.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

<<<<<<< HEAD
    const result = loginCustomer(trimmed, password.trim());
=======
    const result = await loginCustomer(trimmed, password.trim());
>>>>>>> master
    if (!result.ok) {
      setErrors({ form: result.message || "Credenciales inválidas." });
      return;
    }

    showNotification({
      message: "Sesión iniciada.",
      kind: "success",
      mode: "dialog",
      actionLabel: "Ir al inicio",
      onAction: () => navigate("/", { replace: true })
    });
  };

<<<<<<< HEAD
  const handleAdminSubmit = (event: FormEvent<HTMLFormElement>) => {
=======
  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
>>>>>>> master
    event.preventDefault();
    const nextErrors: typeof adminErrors = {};

    const trimmedEmail = adminEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      nextErrors.email = "Ingresa tu correo administrativo.";
    } else if (trimmedEmail.length > 100 || !trimmedEmail.includes("@")) {
      nextErrors.email = "Correo inválido.";
    }

    if (!adminPassword.trim()) {
      nextErrors.password = "Ingresa tu contraseña.";
    }

    if (Object.keys(nextErrors).length) {
      setAdminErrors(nextErrors);
      return;
    }

<<<<<<< HEAD
    const result = adminLogin(trimmedEmail, adminPassword.trim());
=======
    const result = await adminLogin(trimmedEmail, adminPassword.trim());
>>>>>>> master
    if (!result.ok) {
      setAdminErrors({ form: result.message || "Acceso denegado." });
      return;
    }

    showNotification({
      message: "Bienvenido al panel administrativo",
      kind: "success",
      mode: "dialog",
      actionLabel: "Entrar",
      onAction: () => navigate("/admin", { replace: true })
    });
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    if (nextMode === "customer") {
      setAdminErrors({});
      setAdminEmail("");
      setAdminPassword("");
    } else {
      setErrors({});
      setEmail("");
      setPassword("");
    }
  };

  return (
    <main className="container auth" style={{ padding: "32px 0 48px" }}>
      <section className="auth-hero">
        <h1 className="auth-hero__title font-brand">Pastelería Mil Sabores</h1>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          {mode === "customer" ? "Inicio de sesión" : "Acceso administrativo"}
          <button
            type="button"
            onClick={() => switchMode(mode === "customer" ? "admin" : "customer")}
            title={mode === "customer" ? "Abrir acceso administrativo" : "Volver a clientes"}
            style={{ marginLeft: "8px", fontSize: "1.2rem", border: "none", background: "transparent", cursor: "pointer" }}
            aria-label={mode === "customer" ? "Abrir inicio de sesión administrativo" : "Volver al inicio de sesión de clientes"}
          >
            {mode === "customer" ? "👤" : "🍰"}
          </button>
        </div>

        {mode === "customer" ? (
          <form className="auth-form" onSubmit={handleCustomerSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="loginEmail">Correo</label>
              <input
                id="loginEmail"
                type="email"
                className="input"
                maxLength={100}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <small className="help">{errors.email}</small>
            </div>

            <div className="form-row">
              <label htmlFor="loginPass">Contraseña</label>
              <input
                id="loginPass"
                type="password"
                className="input"
                maxLength={10}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <small className="help">{errors.password}</small>
            </div>

            {errors.form && <p className="error" role="alert">{errors.form}</p>}

            <div className="form-actions">
              <button className="btn btn--primary" type="submit">
                Ingresar
              </button>
            </div>

            <p className="auth-note">
              ¿No tienes cuenta? <Link className="link" to="/registro">Regístrate</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleAdminSubmit} noValidate>
            <p className="muted" style={{ margin: "0", textAlign: "center" }}>
              Acceso exclusivo para administradores y vendedores registrados.
            </p>

            <div className="form-row">
              <label htmlFor="adminEmail">Correo administrativo</label>
              <input
                id="adminEmail"
                type="email"
                className="input"
                maxLength={100}
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                required
              />
              <small className="help">{adminErrors.email}</small>
            </div>

            <div className="form-row">
              <label htmlFor="adminPass">Contraseña</label>
              <input
                id="adminPass"
                type="password"
                className="input"
                maxLength={20}
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                required
              />
              <small className="help">{adminErrors.password}</small>
            </div>

            {adminErrors.form && <p className="error" role="alert">{adminErrors.form}</p>}

            <div className="form-actions">
              <button className="btn btn--primary" type="submit">
                Ingresar al panel
              </button>
            </div>

            <p className="auth-note">
              ¿Eres cliente? <button
                className="link"
                type="button"
                onClick={() => switchMode("customer")}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                Volver a inicio de sesión
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
