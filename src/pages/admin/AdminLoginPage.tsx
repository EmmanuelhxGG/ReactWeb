import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminSession, adminLogin, showNotification } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (adminSession) {
      navigate("/admin", { replace: true });
    }
  }, [adminSession, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      nextErrors.email = "Ingresa tu correo";
    } else if (trimmedEmail.length > 100 || !trimmedEmail.includes("@")) {
      nextErrors.email = "Correo inválido";
    }

    if (!password.trim()) {
      nextErrors.password = "Ingresa tu contraseña";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const result = adminLogin(trimmedEmail, password.trim());
    if (!result.ok) {
      setErrors({ form: result.message || "Acceso denegado" });
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

  return (
    <main className="login-body" style={{ padding: "48px 16px" }}>
      <div className="login-container">
        <section className="login-card">
          <h1 className="login-title">Panel Administrativo</h1>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="adminEmail">Correo</label>
              <input
                id="adminEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={100}
                required
              />
              <small className="help">{errors.email}</small>
            </div>

            <div className="form-group">
              <label htmlFor="adminPass">Contraseña</label>
              <input
                id="adminPass"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                maxLength={20}
                required
              />
              <small className="help">{errors.password}</small>
            </div>

            {errors.form && <p className="error" role="alert">{errors.form}</p>}

            <div className="form-actions">
              <button className="btn btn--principal" type="submit" style={{ width: "100%" }}>
                Ingresar
              </button>
            </div>
          </form>
          <footer className="footer-login">
            ¿Problemas de acceso? Contacta a sistemas@pasteleria.cl
          </footer>
        </section>
      </div>
    </main>
  );
}
