import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useRegions } from "../../hooks/useRegions";
import { computeAge, parseLocalDate } from "../../utils/dates";
import { cleanRun, formatRun, isEmailAllowed, isRunValid } from "../../utils/validators";

type RoleOption = "Administrador" | "Cliente";
const ROLE_OPTIONS: RoleOption[] = ["Administrador", "Cliente"];
type StaffRoleOption = "Administrador" | "Vendedor";
const STAFF_ROLE_OPTIONS: StaffRoleOption[] = ["Administrador", "Vendedor"];

const STAFF_INITIAL_FORM = {
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  staffRole: "Administrador" as StaffRoleOption,
  region: "",
  comuna: "",
  password: "",
  confirmPassword: ""
};

const STAFF_NAME_SANITIZE_REGEX = /[^a-zA-ZÁÉÍÓÚáéíóúÜüÑñ\s]/g;
const STAFF_PASSWORD_MIN = 8;
const STAFF_PASSWORD_MAX = 20;

const SHIPPING_OPTIONS = [
  { value: 3000, label: "Envío urbano ($3.000)" },
  { value: 6000, label: "Envío regional ($6.000)" }
];
const DEFAULT_SHIP_VALUE = SHIPPING_OPTIONS[0]?.value ?? 0;

const CUSTOMER_NAME_SANITIZE_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g;
const RUN_MAX_LENGTH = 9;
const MIN_BIRTH_YEAR = 1915;
const MAX_BIRTH_YEAR = 2025;
const MIN_BIRTHDATE = `${MIN_BIRTH_YEAR}-01-01`;
const MAX_BIRTHDATE = `${MAX_BIRTH_YEAR}-12-31`;
const MIN_BIRTHDATE_VALUE = parseLocalDate(MIN_BIRTHDATE)!;
const MAX_BIRTHDATE_VALUE = parseLocalDate(MAX_BIRTHDATE)!;
const MIN_AGE = 18;
const MAX_AGE = 110;

type ErrorRecord = Record<string, string>;

type StaffFormState = typeof STAFF_INITIAL_FORM;

type StaffFormProps = {
  activeRole: RoleOption;
  onSwitchRole: (role: RoleOption) => void;
  onCreated: () => void;
};

type CustomerFormProps = {
  onSwitchRole: (role: RoleOption) => void;
  roleLocked?: boolean;
  mode: "create" | "edit";
  customerIdentifier?: string;
  onCancel: () => void;
};

type CustomerSnapshot = {
  run: string;
  nombres: string;
  apellidos: string;
  email: string;
  fecha: string;
  region: string;
  comuna: string;
  direccion: string;
  phone: string;
  promo: string;
  defaultShip: number;
  newsletter: boolean;
  saveAddress: boolean;
};

function AdminStaffForm({ activeRole, onSwitchRole, onCreated }: StaffFormProps) {
  const { upsertAdminUser, showNotification } = useAppContext();
  const { regions: regionsMap, loading: regionsLoading, error: regionsError } = useRegions();

  const [form, setForm] = useState<StaffFormState>(STAFF_INITIAL_FORM);
  const [runDisplay, setRunDisplay] = useState("");
  const [runTouched, setRunTouched] = useState(false);
  const [errors, setErrors] = useState<ErrorRecord>({});
  const [saving, setSaving] = useState(false);

  const regionOptions = useMemo(
    () => Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, "es")),
    [regionsMap]
  );

  const comunaOptions = useMemo(() => {
    const list = regionsMap[form.region] || [];
    return list.slice().sort((a, b) => a.localeCompare(b, "es"));
  }, [regionsMap, form.region]);

  const sanitizeStaffName = (value: string) =>
    value.replace(STAFF_NAME_SANITIZE_REGEX, " ").replace(/\s{2,}/g, " ");

  const validateRunValue = (value: string): string => {
    if (!value) return "Falta completar el RUN.";
    if (value.length < 7) return "RUN incompleto.";
    if (!isRunValid(value)) return "RUN inválido, verifica el dígito verificador.";
    return "";
  };

  const syncRunError = (value: string, force = false) => {
    if (!runTouched && !force) return;
    const message = validateRunValue(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next.run = message;
      } else {
        delete next.run;
      }
      return next;
    });
  };

  const handleRunChange = (value: string) => {
    const cleaned = cleanRun(value).slice(0, RUN_MAX_LENGTH);
    setForm((prev) => ({ ...prev, run: cleaned }));
    setRunDisplay(cleaned);
    if (!runTouched && cleaned) {
      setRunTouched(true);
    }
    syncRunError(cleaned);
  };

  const handleRunBlur = () => {
    if (!runTouched) {
      setRunTouched(true);
    }
    syncRunError(form.run, true);
    setRunDisplay(form.run ? formatRun(form.run) : "");
  };

  const handleRunFocus = () => {
    setRunDisplay(form.run);
  };

  const handleFieldChange = (field: keyof StaffFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(STAFF_INITIAL_FORM);
    setRunDisplay("");
    setRunTouched(false);
    setErrors({});
    setSaving(false);
  };

  const validate = () => {
    const next: ErrorRecord = {};

    const runMessage = validateRunValue(form.run);
    if (runMessage) {
      next.run = runMessage;
    }

    const nombreNormalized = sanitizeStaffName(form.nombre).trim();
    const apellidosNormalized = sanitizeStaffName(form.apellidos).trim();

    if (!nombreNormalized) {
      next.nombre = "Falta completar los nombres.";
    } else if (nombreNormalized.length > 60) {
      next.nombre = "Máximo 60 caracteres.";
    }

    if (!apellidosNormalized) {
      next.apellidos = "Falta completar los apellidos.";
    } else if (apellidosNormalized.length > 120) {
      next.apellidos = "Máximo 120 caracteres.";
    }

    const trimmedEmail = form.correo.trim();
    if (!trimmedEmail) {
      next.correo = "Falta completar el correo.";
    } else if (trimmedEmail.length > 120 || !isEmailAllowed(trimmedEmail)) {
      next.correo = "Correo permitido (duoc.cl, profesor.duoc.cl o gmail).";
    }

    if (!form.region) {
      next.region = "Selecciona una región.";
    }
    if (!form.comuna) {
      next.comuna = "Selecciona una comuna.";
    }

    if (!form.password) {
      next.password = "Falta ingresar una contraseña.";
    } else if (form.password.length < STAFF_PASSWORD_MIN || form.password.length > STAFF_PASSWORD_MAX) {
      next.password = `Debe tener entre ${STAFF_PASSWORD_MIN} y ${STAFF_PASSWORD_MAX} caracteres.`;
    }

    if (!form.confirmPassword) {
      next.confirmPassword = "Confirma la contraseña.";
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = "La confirmación debe coincidir.";
    }

    if (Object.keys(next).length) {
      next.form = "Corrige los campos marcados antes de continuar.";
      setErrors(next);
      return null;
    }

    setErrors({});
    return {
      run: form.run.toUpperCase(),
      nombre: nombreNormalized,
      apellidos: apellidosNormalized,
      correo: trimmedEmail,
      region: form.region,
      comuna: form.comuna,
      password: form.password,
      staffRole: form.staffRole
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const payload = validate();
    if (!payload) return;

    setSaving(true);
    const result = await upsertAdminUser({
      run: payload.run,
      nombre: payload.nombre,
      apellidos: payload.apellidos,
      correo: payload.correo,
      password: payload.password,
      rol: payload.staffRole,
      region: payload.region,
      comuna: payload.comuna
    });
    setSaving(false);

    if (!result.ok) {
      setErrors(result.message ? { form: result.message } : { form: "No se pudo registrar al colaborador." });
      return;
    }

    resetForm();
    showNotification({
      message: "Colaborador registrado correctamente.",
      kind: "success",
      mode: "dialog",
      actionLabel: "Ir al listado",
      cancelLabel: "Seguir agregando",
      onAction: onCreated
    });
  };

  return (
    <section className="admin-form">
      <h2 style={{ marginBottom: "16px" }}>Registrar colaborador</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminStaffRun">RUN (sin puntos ni guion)</label>
            <input
              id="adminStaffRun"
              type="text"
              value={runDisplay}
              onChange={(event) => handleRunChange(event.target.value)}
              onBlur={handleRunBlur}
              onFocus={handleRunFocus}
              maxLength={12}
              required
              autoComplete="off"
              aria-invalid={Boolean(errors.run)}
            />
            <small className={`help${errors.run ? " help--error" : ""}`}>{errors.run}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminStaffSwitch">Tipo de cuenta</label>
            <select
              id="adminStaffSwitch"
              value={activeRole}
              onChange={(event) => onSwitchRole(event.target.value as RoleOption)}
              disabled={saving}
            >
              {ROLE_OPTIONS.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <small className="help">Elige “Cliente” para registrar o editar un cliente.</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminStaffNombre">Nombres</label>
            <input
              id="adminStaffNombre"
              type="text"
              value={form.nombre}
              onChange={(event) => handleFieldChange("nombre", sanitizeStaffName(event.target.value))}
              maxLength={60}
              required
              autoComplete="given-name"
              aria-invalid={Boolean(errors.nombre)}
            />
            <small className={`help${errors.nombre ? " help--error" : ""}`}>{errors.nombre}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminStaffApellidos">Apellidos</label>
            <input
              id="adminStaffApellidos"
              type="text"
              value={form.apellidos}
              onChange={(event) => handleFieldChange("apellidos", sanitizeStaffName(event.target.value))}
              maxLength={120}
              required
              autoComplete="family-name"
              aria-invalid={Boolean(errors.apellidos)}
            />
            <small className={`help${errors.apellidos ? " help--error" : ""}`}>{errors.apellidos}</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminStaffCorreo">Correo</label>
            <input
              id="adminStaffCorreo"
              type="email"
              value={form.correo}
              onChange={(event) => handleFieldChange("correo", event.target.value)}
              maxLength={120}
              required
              autoComplete="email"
              aria-invalid={Boolean(errors.correo)}
            />
            <small className={`help${errors.correo ? " help--error" : ""}`}>{errors.correo}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminStaffRolInterno">Rol interno</label>
            <select
              id="adminStaffRolInterno"
              value={form.staffRole}
              onChange={(event) => handleFieldChange("staffRole", event.target.value as StaffRoleOption)}
            >
              {STAFF_ROLE_OPTIONS.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <small className="help">Determina los permisos internos del colaborador.</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminStaffRegion">Región</label>
            <select
              id="adminStaffRegion"
              value={form.region}
              onChange={(event) => {
                const nextRegion = event.target.value;
                handleFieldChange("region", nextRegion);
                if (nextRegion !== form.region) {
                  handleFieldChange("comuna", "");
                }
              }}
              disabled={regionsLoading}
            >
              <option value="">Seleccione</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <small className={`help${errors.region ? " help--error" : ""}`}>
              {errors.region || regionsError}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="adminStaffComuna">Comuna</label>
            <select
              id="adminStaffComuna"
              value={form.comuna}
              onChange={(event) => handleFieldChange("comuna", event.target.value)}
              disabled={!form.region || regionsLoading}
            >
              <option value="">Seleccione</option>
              {comunaOptions.map((com) => (
                <option key={com} value={com}>
                  {com}
                </option>
              ))}
            </select>
            <small className={`help${errors.comuna ? " help--error" : ""}`}>{errors.comuna}</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminStaffPassword">Contraseña</label>
            <input
              id="adminStaffPassword"
              type="password"
              value={form.password}
              onChange={(event) => handleFieldChange("password", event.target.value)}
              maxLength={STAFF_PASSWORD_MAX}
              required
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
            />
            <small className={`help${errors.password ? " help--error" : ""}`}>{errors.password}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminStaffConfirm">Confirmar contraseña</label>
            <input
              id="adminStaffConfirm"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => handleFieldChange("confirmPassword", event.target.value)}
              maxLength={STAFF_PASSWORD_MAX}
              required
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            <small className={`help${errors.confirmPassword ? " help--error" : ""}`}>{errors.confirmPassword}</small>
          </div>
        </div>

        {errors.form && (
          <p className="error" role="alert">
            {errors.form}
          </p>
        )}

        <div className="form-actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar colaborador"}
          </button>
          <button className="btn" type="button" onClick={resetForm} disabled={saving}>
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}

function AdminCustomerForm({ onSwitchRole, roleLocked, mode, customerIdentifier, onCancel }: CustomerFormProps) {
  const navigate = useNavigate();
  const { createCustomerAsAdmin, upsertCustomer, customers, showNotification } = useAppContext();
  const { regions: regionsMap, loading: regionsLoading, error: regionsError } = useRegions();

  const [runValue, setRunValue] = useState("");
  const [runDisplay, setRunDisplay] = useState("");
  const [runTouched, setRunTouched] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [birthTouched, setBirthTouched] = useState(false);
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fono, setFono] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [promo, setPromo] = useState("");
  const [defaultShip, setDefaultShip] = useState(DEFAULT_SHIP_VALUE);
  const [newsletter, setNewsletter] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [errors, setErrors] = useState<ErrorRecord>({});
  const [baseline, setBaseline] = useState<CustomerSnapshot | null>(null);
  const [lookupNotified, setLookupNotified] = useState(false);

  const regionOptions = useMemo(
    () => Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, "es")),
    [regionsMap]
  );

  const comunaOptions = useMemo(() => {
    const list = regionsMap[region] || [];
    return list.slice().sort((a, b) => a.localeCompare(b, "es"));
  }, [regionsMap, region]);

  const sanitizeNameInput = (value: string) =>
    value.replace(CUSTOMER_NAME_SANITIZE_REGEX, " ").replace(/\s{2,}/g, " ");

  const initialCustomer = useMemo(() => {
    if (mode !== "edit") return undefined;
    if (!customerIdentifier) return undefined;
    const normalizedId = customerIdentifier.toLowerCase();
    return customers.find((customer) => {
      if (!customer) return false;
      if (customer.id && customer.id === customerIdentifier) return true;
      return customer.email.toLowerCase() === normalizedId;
    });
  }, [mode, customerIdentifier, customers]);

  useEffect(() => {
    if (mode !== "edit") {
      setBaseline(null);
      setLookupNotified(false);
      return;
    }
    if (!initialCustomer) return;

    const cleanedRun = cleanRun(initialCustomer.run ?? "");
    setRunValue(cleanedRun);
    setRunDisplay(cleanedRun ? formatRun(cleanedRun) : "");
    setRunTouched(false);
    setNombres(initialCustomer.nombre ?? "");
    setApellidos(initialCustomer.apellidos ?? "");
    setEmail(initialCustomer.email ?? "");
    setFecha(initialCustomer.fnac ?? "");
    setBirthTouched(false);
    setRegion(initialCustomer.region ?? "");
    setComuna(initialCustomer.comuna ?? "");
    setDireccion(initialCustomer.direccion ?? "");
    setFono(initialCustomer.phone ?? "");
    setPass("");
    setPass2("");
    setPromo(initialCustomer.promoCode ?? "");
    setDefaultShip(initialCustomer.prefs?.defaultShip ?? DEFAULT_SHIP_VALUE);
    setNewsletter(initialCustomer.prefs?.newsletter ?? false);
    setSaveAddress(initialCustomer.prefs?.saveAddress ?? false);
    setErrors({});
    setBaseline({
      run: cleanedRun,
      nombres: sanitizeNameInput(initialCustomer.nombre ?? "").trim(),
      apellidos: sanitizeNameInput(initialCustomer.apellidos ?? "").trim(),
      email: (initialCustomer.email ?? "").trim().toLowerCase(),
      fecha: initialCustomer.fnac ?? "",
      region: initialCustomer.region ?? "",
      comuna: initialCustomer.comuna ?? "",
      direccion: (initialCustomer.direccion ?? "").trim(),
      phone: (initialCustomer.phone ?? "").trim(),
      promo: (initialCustomer.promoCode ?? "").trim().toUpperCase(),
      defaultShip: initialCustomer.prefs?.defaultShip ?? DEFAULT_SHIP_VALUE,
      newsletter: initialCustomer.prefs?.newsletter ?? false,
      saveAddress: initialCustomer.prefs?.saveAddress ?? false
    });
  }, [mode, initialCustomer]);

  useEffect(() => {
    if (mode !== "edit") return;
    if (initialCustomer || !customerIdentifier || lookupNotified) return;
    showNotification({
      message: "No encontramos este cliente. Regresa al listado e inténtalo nuevamente.",
      kind: "error",
      mode: "dialog",
      actionLabel: "Volver",
      onAction: onCancel
    });
    setLookupNotified(true);
  }, [mode, initialCustomer, customerIdentifier, lookupNotified, showNotification, onCancel]);

  const validateRunValue = (value: string): string => {
    if (!value) return "Falta completar el RUN.";
    if (value.length < 7) return "RUN incompleto.";
    if (!isRunValid(value)) return "RUN inválido, verifica el dígito verificador.";
    return "";
  };

  const syncRunError = (value: string, force = false) => {
    if (!runTouched && !force) return;
    const message = validateRunValue(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next.run = message;
      } else {
        delete next.run;
      }
      return next;
    });
  };

  const validateBirthdate = (value: string): string => {
    if (!value) return "Falta completar la fecha de nacimiento.";
    if (value.length < 10) return "";
    const parsedBirth = parseLocalDate(value);
    if (!parsedBirth) return "Fecha inválida.";
    if (parsedBirth < MIN_BIRTHDATE_VALUE) return "Fecha inválida: máximo 110 años.";
    if (parsedBirth > MAX_BIRTHDATE_VALUE) return `La fecha debe ser hasta ${MAX_BIRTH_YEAR}.`;
    const age = computeAge(value);
    if (typeof age !== "number") return "Fecha inválida.";
    if (age < MIN_AGE) return "Debes tener 18 años o más.";
    if (age > MAX_AGE) return "Fecha inválida: máximo 110 años.";
    return "";
  };

  const setBirthError = (message: string) => {
    setErrors((prev) => {
      if (message) {
        return { ...prev, fecha: message };
      }
      if (!prev.fecha) return prev;
      const { fecha: _omit, ...rest } = prev;
      return rest;
    });
  };

  const clampBirthdate = (value: string) => {
    if (!value) return "";
    const parsedBirth = parseLocalDate(value);
    if (!parsedBirth) return value;
    if (parsedBirth < MIN_BIRTHDATE_VALUE) return MIN_BIRTHDATE;
    if (parsedBirth > MAX_BIRTHDATE_VALUE) return MAX_BIRTHDATE;
    const age = computeAge(value);
    if (typeof age === "number" && age > MAX_AGE) return MIN_BIRTHDATE;
    return value;
  };

  const handleRunChange = (value: string) => {
    const cleaned = cleanRun(value).slice(0, RUN_MAX_LENGTH);
    setRunValue(cleaned);
    setRunDisplay(cleaned);
    if (!runTouched && cleaned.length > 0) {
      setRunTouched(true);
    }
    syncRunError(cleaned);
  };

  const handleRunBlur = () => {
    if (!runTouched) {
      setRunTouched(true);
    }
    syncRunError(runValue, true);
    setRunDisplay(runValue ? formatRun(runValue) : "");
  };

  const handleRunFocus = () => {
    setRunDisplay(runValue);
  };

  const handleBirthdateChange = (value: string) => {
    setFecha(value);
    if (!birthTouched && value) {
      setBirthTouched(true);
    }
    if (birthTouched) {
      setBirthError(validateBirthdate(value));
    }
  };

  const handleBirthdateBlur = () => {
    if (!birthTouched) {
      setBirthTouched(true);
    }
    const message = validateBirthdate(fecha);
    const corrected = clampBirthdate(fecha);
    setFecha(corrected);
    setBirthError(message);
  };

  const resetForm = () => {
    setRunValue("");
    setRunDisplay("");
    setRunTouched(false);
    setNombres("");
    setApellidos("");
    setEmail("");
    setFecha("");
    setBirthTouched(false);
    setRegion("");
    setComuna("");
    setDireccion("");
    setFono("");
    setPass("");
    setPass2("");
    setPromo("");
    setDefaultShip(DEFAULT_SHIP_VALUE);
    setNewsletter(false);
    setSaveAddress(false);
    setErrors({});
    setBaseline(null);
  };

  const currentSnapshot = useMemo<CustomerSnapshot>(
    () => ({
      run: runValue,
      nombres: sanitizeNameInput(nombres).trim(),
      apellidos: sanitizeNameInput(apellidos).trim(),
      email: email.trim().toLowerCase(),
      fecha,
      region,
      comuna,
      direccion: direccion.trim(),
      phone: fono.trim(),
      promo: promo.trim().toUpperCase(),
      defaultShip,
      newsletter,
      saveAddress
    }),
    [runValue, nombres, apellidos, email, fecha, region, comuna, direccion, fono, promo, defaultShip, newsletter, saveAddress]
  );

  const isDirty = useMemo(() => {
    if (mode !== "edit") return true;
    if (!baseline) return false;
    return JSON.stringify(currentSnapshot) !== JSON.stringify(baseline);
  }, [mode, baseline, currentSnapshot]);

  const validate = () => {
    const next: ErrorRecord = {};

    const runMessage = validateRunValue(runValue);
    if (runMessage) {
      next.run = runMessage;
    }

    const nombresNormalized = sanitizeNameInput(nombres).trim();
    const apellidosNormalized = sanitizeNameInput(apellidos).trim();

    if (!nombresNormalized) {
      next.nombres = "Falta completar los nombres.";
    } else if (nombresNormalized.length > 50) {
      next.nombres = "Máximo 50 caracteres.";
    }

    if (!apellidosNormalized) {
      next.apellidos = "Falta completar los apellidos.";
    } else if (apellidosNormalized.length > 100) {
      next.apellidos = "Máximo 100 caracteres.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "Falta completar el correo.";
    } else if (trimmedEmail.length > 100 || !isEmailAllowed(trimmedEmail)) {
      next.email = "Correo permitido (duoc.cl, profesor.duoc.cl o gmail).";
    }

    if (!direccion.trim()) {
      next.direccion = "Falta completar la dirección.";
    } else if (direccion.trim().length > 300) {
      next.direccion = "Máximo 300 caracteres.";
    }

    if (!region) {
      next.region = "Falta seleccionar una región.";
    }
    if (!comuna) {
      next.comuna = "Falta seleccionar una comuna.";
    }

    const birthMessage = validateBirthdate(fecha);
    if (birthMessage) {
      next.fecha = birthMessage;
    }

    if (mode === "create") {
      if (!pass) {
        next.pass = "Falta ingresar una contraseña.";
      } else if (pass.length < 8 || pass.length > 20) {
        next.pass = "Debe tener entre 8 y 20 caracteres.";
      }

      if (!pass2) {
        next.pass2 = "Confirma tu contraseña.";
      } else if (pass2 !== pass) {
        next.pass2 = "La confirmación debe coincidir.";
      }
    }

    if (Object.keys(next).length) {
      next.form = "Corrige los campos marcados antes de continuar.";
      setErrors(next);
      return null;
    }

    setErrors({});
    return {
      nombresNormalized,
      apellidosNormalized,
      trimmedEmail
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "edit" && (!initialCustomer || !isDirty)) {
      return;
    }

    const validation = validate();
    if (!validation) return;

    const { nombresNormalized, apellidosNormalized, trimmedEmail } = validation;
    const promoCode = promo.trim().toUpperCase() || undefined;
    const phoneValue = fono.trim();
    const normalizedRun = runValue.toUpperCase();

    if (mode === "edit") {
      const result = await upsertCustomer({
        ...initialCustomer!,
        run: normalizedRun,
        nombre: nombresNormalized,
        apellidos: apellidosNormalized,
        email: trimmedEmail,
        fnac: fecha,
        region,
        comuna,
        direccion: direccion.trim(),
        phone: phoneValue || undefined,
        promoCode,
        prefs: {
          ...initialCustomer?.prefs,
          defaultShip,
          newsletter,
          saveAddress
        }
      });

      if (!result.ok) {
        setErrors(result.message ? { form: result.message } : { form: "No se pudo actualizar el cliente." });
        return;
      }

      setBaseline(currentSnapshot);
      showNotification({
        message: "Datos del cliente actualizados.",
        kind: "success",
        mode: "dialog",
        actionLabel: "Volver al listado",
        cancelLabel: "Seguir editando",
        onAction: onCancel
      });
      return;
    }

    const result = await createCustomerAsAdmin({
      run: normalizedRun,
      tipo: "Cliente",
      nombre: nombresNormalized,
      apellidos: apellidosNormalized,
      email: trimmedEmail,
      fnac: fecha,
      region,
      comuna,
      direccion: direccion.trim(),
      phone: phoneValue,
      pass,
      promoCode,
      prefs: {
        defaultShip,
        newsletter,
        saveAddress
      }
    });

    if (!result.ok) {
      setErrors(result.message ? { form: result.message } : { form: "No pudimos registrar la cuenta." });
      return;
    }

    resetForm();
    showNotification({
      message: "Cliente registrado correctamente.",
      kind: "success",
      mode: "dialog",
      actionLabel: "Ir al listado",
      onAction: () => navigate("/admin/usuarios")
    });
  };

  const submitLabel = mode === "edit" ? "Cambiar datos" : "Guardar cliente";
  const secondaryLabel = mode === "edit" ? "Cancelar" : "Limpiar";
  const submitDisabled = mode === "edit" && (!initialCustomer || !isDirty);

  if (mode === "edit" && customerIdentifier && !initialCustomer && lookupNotified) {
    return (
      <section className="admin-form">
        <h2 style={{ marginBottom: "16px" }}>Editar cliente</h2>
        <div className="card" style={{ padding: "24px" }}>
          <p style={{ marginBottom: "16px" }}>No encontramos los datos de este cliente.</p>
          <button className="btn btn--primary" type="button" onClick={onCancel}>
            Volver al listado
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-form">
      <h2 style={{ marginBottom: "16px" }}>{mode === "edit" ? "Editar cliente" : "Registro de cliente"}</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClienteRun">RUN (sin puntos ni guion)</label>
            <input
              id="adminClienteRun"
              type="text"
              value={runDisplay}
              onChange={(event) => handleRunChange(event.target.value)}
              onBlur={handleRunBlur}
              onFocus={handleRunFocus}
              maxLength={12}
              required
              autoComplete="off"
              aria-invalid={Boolean(errors.run)}
            />
            <small className={`help${errors.run ? " help--error" : ""}`}>{errors.run}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminClienteRol">Rol</label>
            <select
              id="adminClienteRol"
              value="Cliente"
              onChange={(event) => onSwitchRole(event.target.value as RoleOption)}
              disabled={roleLocked}
            >
              {ROLE_OPTIONS.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <small className="help">Selecciona “Administrador” para volver al formulario anterior.</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClienteNombre">Nombres</label>
            <input
              id="adminClienteNombre"
              type="text"
              value={nombres}
              onChange={(event) => setNombres(sanitizeNameInput(event.target.value))}
              maxLength={50}
              required
              autoComplete="given-name"
              aria-invalid={Boolean(errors.nombres)}
            />
            <small className={`help${errors.nombres ? " help--error" : ""}`}>{errors.nombres}</small>
          </div>
          <div className="form-group">
            <label htmlFor="adminClienteApellidos">Apellidos</label>
            <input
              id="adminClienteApellidos"
              type="text"
              value={apellidos}
              onChange={(event) => setApellidos(sanitizeNameInput(event.target.value))}
              maxLength={100}
              required
              autoComplete="family-name"
              aria-invalid={Boolean(errors.apellidos)}
            />
            <small className={`help${errors.apellidos ? " help--error" : ""}`}>{errors.apellidos}</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClienteCorreo">
              Correo <span className="small muted">(usa tu <b>@duoc.cl</b> si eres estudiante)</span>
            </label>
            <input
              id="adminClienteCorreo"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={100}
              required
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
            />
            <small className={`help${errors.email ? " help--error" : ""}`}>
              {errors.email || "Si usas tu correo DUOC tendrás beneficios el día de tu cumpleaños."}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="adminClienteFnac">Fecha de nacimiento (recomendado)</label>
            <input
              id="adminClienteFnac"
              type="date"
              value={fecha}
              onChange={(event) => handleBirthdateChange(event.target.value)}
              onBlur={handleBirthdateBlur}
              min={MIN_BIRTHDATE}
              max={MAX_BIRTHDATE}
              aria-invalid={Boolean(errors.fecha)}
            />
            <small className={`help${errors.fecha ? " help--error" : ""}`}>{errors.fecha}</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClienteRegion">Región</label>
            <select
              id="adminClienteRegion"
              value={region}
              onChange={(event) => {
                const nextRegion = event.target.value;
                const regionChanged = nextRegion !== region;
                setRegion(nextRegion);
                if (regionChanged) {
                  setComuna("");
                }
              }}
              disabled={regionsLoading}
            >
              <option value="">Seleccione</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <small className={`help${errors.region ? " help--error" : ""}`}>
              {errors.region || regionsError}
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="adminClienteComuna">Comuna</label>
            <select
              id="adminClienteComuna"
              value={comuna}
              onChange={(event) => setComuna(event.target.value)}
              disabled={!region || regionsLoading}
            >
              <option value="">Seleccione</option>
              {comunaOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <small className={`help${errors.comuna ? " help--error" : ""}`}>{errors.comuna}</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="adminClienteDireccion">Dirección</label>
          <input
            id="adminClienteDireccion"
            type="text"
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
            maxLength={300}
            required
            aria-invalid={Boolean(errors.direccion)}
          />
          <small className={`help${errors.direccion ? " help--error" : ""}`}>{errors.direccion}</small>
        </div>

        {mode === "create" && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adminClientePass">Contraseña</label>
              <input
                id="adminClientePass"
                type="password"
                value={pass}
                onChange={(event) => setPass(event.target.value)}
                maxLength={20}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(errors.pass)}
              />
              <small className={`help${errors.pass ? " help--error" : ""}`}>{errors.pass}</small>
            </div>
            <div className="form-group">
              <label htmlFor="adminClientePass2">Confirmar contraseña</label>
              <input
                id="adminClientePass2"
                type="password"
                value={pass2}
                onChange={(event) => setPass2(event.target.value)}
                maxLength={20}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(errors.pass2)}
              />
              <small className={`help${errors.pass2 ? " help--error" : ""}`}>{errors.pass2}</small>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClientePhone">Teléfono (opcional)</label>
            <input
              id="adminClientePhone"
              type="tel"
              value={fono}
              onChange={(event) => setFono(event.target.value)}
              maxLength={25}
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminClientePromo">Código de promoción (opcional)</label>
            <input
              id="adminClientePromo"
              type="text"
              value={promo}
              onChange={(event) => setPromo(event.target.value)}
              placeholder="FELICES50"
              maxLength={20}
            />
            <small className="help">Si usas FELICES50 tendrás 10% permanente.</small>
          </div>
        </div>

        <h3 className="about-subtitle" style={{ marginTop: "24px" }}>
          Preferencias de compra
        </h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="adminClientePrefShip">Envío por defecto</label>
            <select
              id="adminClientePrefShip"
              value={defaultShip}
              onChange={(event) => setDefaultShip(Number(event.target.value))}
            >
              {SHIPPING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="help">Se usará en el carrito si no has elegido otro.</small>
          </div>
        </div>

        <div className="form-group">
          <div className="chk">
            <input
              id="adminClienteNewsletter"
              type="checkbox"
              checked={newsletter}
              onChange={(event) => setNewsletter(event.target.checked)}
            />
            <label htmlFor="adminClienteNewsletter">Quiero recibir promociones por email</label>
          </div>
          <div className="chk" style={{ marginTop: "8px" }}>
            <input
              id="adminClienteSaveAddr"
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => setSaveAddress(event.target.checked)}
            />
            <label htmlFor="adminClienteSaveAddr">Guardar dirección para próximos pedidos</label>
          </div>
        </div>

        {errors.form && (
          <p className="error" role="alert">
            {errors.form}
          </p>
        )}

        <div className="form-actions">
          <button className="btn btn--primary" type="submit" disabled={submitDisabled}>
            {submitLabel}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (mode === "edit") {
                onCancel();
              } else {
                resetForm();
              }
            }}
          >
            {secondaryLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

type AdminRouteState = {
  mode?: string;
  customerId?: string | null;
  email?: string | null;
};

export function AdminUsuariosNuevoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? null) as AdminRouteState | null;
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const requestedRoleParam = (searchParams.get("tipo") ?? "administrador").toLowerCase();
  const requestedRole: RoleOption = requestedRoleParam === "cliente" ? "Cliente" : "Administrador";

  const editingCustomer = useMemo(() => {
    if (routeState?.mode === "edit-customer") return true;
    if (requestedRole === "Cliente") {
      return Boolean(routeState?.customerId || routeState?.email || searchParams.get("id") || searchParams.get("email"));
    }
    return false;
  }, [requestedRole, routeState, searchParams]);

  const [activeRole, setActiveRole] = useState<RoleOption>(editingCustomer ? "Cliente" : requestedRole);

  useEffect(() => {
    setActiveRole(editingCustomer ? "Cliente" : requestedRole);
  }, [editingCustomer, requestedRole]);

  const handleSwitchRole = (role: RoleOption) => {
    if (editingCustomer) return;
    setActiveRole(role);
    const nextParams = new URLSearchParams(location.search);
    if (role === "Cliente") {
      nextParams.set("tipo", "cliente");
    } else {
      nextParams.set("tipo", "administrador");
      nextParams.delete("id");
      nextParams.delete("email");
    }
    navigate(`/admin/usuario-nuevo?${nextParams.toString()}`, { replace: true });
  };

  const handleReturnToList = () => navigate("/admin/usuarios");

  const customerIdentifier = useMemo(() => {
    if (!editingCustomer) return undefined;
    if (routeState?.customerId) return routeState.customerId;
    if (routeState?.email) return routeState.email;
    return searchParams.get("id") ?? searchParams.get("email") ?? undefined;
  }, [editingCustomer, routeState, searchParams]);

  if (activeRole === "Administrador" && !editingCustomer) {
    return (
      <AdminStaffForm
        activeRole={activeRole}
        onSwitchRole={handleSwitchRole}
        onCreated={handleReturnToList}
      />
    );
  }

  return (
    <AdminCustomerForm
      onSwitchRole={handleSwitchRole}
      roleLocked={editingCustomer}
      mode={editingCustomer ? "edit" : "create"}
      customerIdentifier={customerIdentifier}
      onCancel={handleReturnToList}
    />
  );
}
