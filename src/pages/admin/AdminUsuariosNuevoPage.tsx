<<<<<<< HEAD
import { useState } from "react";
=======
import { useMemo, useState } from "react";
>>>>>>> master
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { cleanRun, isRunValid, isEmailAllowed } from "../../utils/validators";
<<<<<<< HEAD
import { REGIONS } from "../../data/regions";
=======
import { useRegions } from "../../hooks/useRegions";
>>>>>>> master

const INITIAL_FORM = {
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  rol: "Administrador",
  region: "",
  comuna: ""
};

const ROLES = ["Administrador", "Marketing", "Inventario", "Ventas"];

export function AdminUsuariosNuevoPage() {
  const navigate = useNavigate();
  const { upsertAdminUser, adminUsers, showNotification } = useAppContext();
  const [form, setForm] = useState(INITIAL_FORM);
<<<<<<< HEAD
  const regionOptions = Object.keys(REGIONS).sort((a, b) => a.localeCompare(b, "es"));
  const comunaOptions = (REGIONS[form.region] || []).slice().sort((a, b) => a.localeCompare(b, "es"));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
=======
  const { regions: regionsMap, loading: regionsLoading, error: regionsError } = useRegions();
  const regionOptions = useMemo(() => Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, "es")), [regionsMap]);
  const comunaOptions = useMemo(
    () => ((regionsMap[form.region] || []).slice().sort((a, b) => a.localeCompare(b, "es"))),
    [form.region, regionsMap]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
>>>>>>> master
    event.preventDefault();
    const next: Record<string, string> = {};

    if (!isRunValid(form.run)) {
      next.run = "RUN inválido";
    } else if (adminUsers.find((user) => user.run.toUpperCase() === form.run.toUpperCase())) {
      next.run = "Este RUN ya está registrado";
    }

    if (!form.nombre.trim()) {
      next.nombre = "Nombre requerido";
    }

    if (!form.apellidos.trim()) {
      next.apellidos = "Apellidos requeridos";
    }

    if (!isEmailAllowed(form.correo)) {
      next.correo = "Correo no permitido";
    }

    if (!form.rol) {
      next.rol = "Selecciona un rol";
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

<<<<<<< HEAD
    upsertAdminUser({
=======
    const result = await upsertAdminUser({
>>>>>>> master
      run: form.run.toUpperCase(),
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim().toLowerCase(),
      rol: form.rol,
      region: form.region.trim() || undefined,
      comuna: form.comuna.trim() || undefined
    });

<<<<<<< HEAD
    setForm(INITIAL_FORM);
=======
    if (!result.ok) {
      showNotification({
        message: result.message ?? "No pudimos registrar al colaborador.",
        kind: "error"
      });
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});
>>>>>>> master
    showNotification({
      message: "Usuario administrativo creado",
      kind: "success",
      mode: "dialog",
      actionLabel: "Ir al listado",
      onAction: () => navigate("/admin/usuarios")
    });
  };

  return (
    <section className="admin-form">
      <h2 style={{ marginBottom: "16px" }}>Registrar nuevo usuario administrativo</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminRun">RUN</label>
            <input
              id="adminRun"
              type="text"
              value={form.run}
              onChange={(event) => setForm((prev) => ({ ...prev, run: cleanRun(event.target.value) }))}
              required
            />
            <small className="help">{errors.run}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminRol">Rol</label>
            <select
              id="adminRol"
              value={form.rol}
              onChange={(event) => setForm((prev) => ({ ...prev, rol: event.target.value }))}
            >
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <small className="help">{errors.rol}</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminNombre">Nombre</label>
            <input
              id="adminNombre"
              type="text"
              value={form.nombre}
              onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
              required
            />
            <small className="help">{errors.nombre}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminApellidos">Apellidos</label>
            <input
              id="adminApellidos"
              type="text"
              value={form.apellidos}
              onChange={(event) => setForm((prev) => ({ ...prev, apellidos: event.target.value }))}
              required
            />
            <small className="help">{errors.apellidos}</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="adminCorreo">Correo</label>
          <input
            id="adminCorreo"
            type="email"
            value={form.correo}
            onChange={(event) => setForm((prev) => ({ ...prev, correo: event.target.value }))}
            required
          />
          <small className="help">{errors.correo || "Usa dominios permitidos: duoc.cl, profesor.duoc.cl o gmail.com"}</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminRegion">Región</label>
            <select
              id="adminRegion"
              value={form.region}
              onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value, comuna: "" }))}
<<<<<<< HEAD
=======
              disabled={regionsLoading}
>>>>>>> master
            >
              <option value="">Seleccione</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
<<<<<<< HEAD
=======
            {regionsError && <small className="help">{regionsError}</small>}
>>>>>>> master
          </div>
          <div className="form-group">
            <label htmlFor="adminComuna">Comuna</label>
            <select
              id="adminComuna"
              value={form.comuna}
              onChange={(event) => setForm((prev) => ({ ...prev, comuna: event.target.value }))}
<<<<<<< HEAD
              disabled={!form.region}
=======
              disabled={!form.region || regionsLoading}
>>>>>>> master
            >
              <option value="">Seleccione</option>
              {comunaOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn--principal" type="submit">
            Guardar usuario
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM);
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}
