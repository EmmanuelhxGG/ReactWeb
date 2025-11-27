import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isEmailAllowed } from "../utils/validators";

type FlashState = {
  message: string;
  type: "success" | "error" | null;
};

export function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; correo?: string; mensaje?: string }>({});
  const [flash, setFlash] = useState<FlashState>({ message: "", type: null });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showFlash = (message: string, type: FlashState["type"]) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setFlash({ message, type });
    timeoutRef.current = window.setTimeout(() => {
      setFlash({ message: "", type: null });
      timeoutRef.current = null;
    }, 4000);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!nombre.trim() || nombre.trim().length > 100) {
      nextErrors.nombre = "Requerido (máx 100)";
    }
    if (!correo.trim()) {
      nextErrors.correo = "Obligatorio";
    } else if (!isEmailAllowed(correo) || correo.trim().length > 100) {
      nextErrors.correo = "Dominio permitido y máx 100";
    }
    if (!mensaje.trim() || mensaje.trim().length > 500) {
      nextErrors.mensaje = "Requerido (máx 500)";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      showFlash("Revisa los campos marcados.", "error");
      return;
    }
    setNombre("");
    setCorreo("");
    setMensaje("");
    setErrors({});
    showFlash("¡Tu mensaje fue enviado con éxito! Nos pondremos en contacto pronto.", "success");
  };

  return (
    <main className="contenedor relleno contacto-page">
      <section className="contact-hero" aria-labelledby="contactTitle">
        <h1 id="contactTitle" className="contact-hero__title font-brand">
          Contáctanos
        </h1>
        <p>Río Quiapo 1955, Villa Valle Central, Chillán</p>
        <p>
          <a href="mailto:contacto@milsabores.cl">contacto@milsabores.cl</a>
        </p>
        <p>+56 9 5006 0498</p>
      </section>

      <section className="contact-card" aria-labelledby="contactFormTitle">
        <h2 id="contactFormTitle" className="contact-card__header">
          Envía un mensaje
        </h2>

        {flash.message && (
          <div className={`flash${flash.type === "error" ? " error" : ""}`} role="status" aria-live="polite">
            {flash.message}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="contactNombre">Tu nombre</label>
            <input
              id="contactNombre"
              className="input"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={100}
              required
            />
            <small className="help">{errors.nombre}</small>
          </div>

          <div className="form-row">
            <label htmlFor="contactCorreo">Tu correo</label>
            <input
              id="contactCorreo"
              className="input"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              maxLength={100}
              required
              placeholder="tucorreo@ejemplo.com"
            />
            <small className="help">{errors.correo}</small>
          </div>

          <div className="form-row">
            <label htmlFor="contactMensaje">Mensaje</label>
            <textarea
              id="contactMensaje"
              className="input"
              rows={5}
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              maxLength={500}
              required
            />
            <small className="help">{errors.mensaje}</small>
          </div>

          <div className="form-actions">
            <button className="btn btn--primary" type="submit">
              Enviar mensaje
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
