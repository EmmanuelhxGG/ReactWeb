import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { REGIONS } from "../data/regions";
import { computeAge, parseLocalDate } from "../utils/dates";
import { cleanRun, formatRun, isEmailAllowed, isRunValid } from "../utils/validators";

const SHIPPING_OPTIONS = [
  { value: 3000, label: "Envío urbano ($3.000)" },
  { value: 6000, label: "Envío regional ($6.000)" }
];
const DEFAULT_SHIP_VALUE = SHIPPING_OPTIONS[0]?.value ?? 0;

const NAME_SANITIZE_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g;

const sanitizeNameInput = (value: string) =>
  value.replace(NAME_SANITIZE_REGEX, " ").replace(/\s{2,}/g, " ");

const RUN_MAX_LENGTH = 9;
const MIN_BIRTH_YEAR = 1915;
const MAX_BIRTH_YEAR = 2025;
const MIN_BIRTHDATE = `${MIN_BIRTH_YEAR}-01-01`;
const MAX_BIRTHDATE = `${MAX_BIRTH_YEAR}-12-31`;
const MIN_BIRTHDATE_VALUE = parseLocalDate(MIN_BIRTHDATE)!;
const MAX_BIRTHDATE_VALUE = parseLocalDate(MAX_BIRTHDATE)!;
const MIN_AGE = 18;
const MAX_AGE = 110;

export function RegistroPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useAppContext();

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRunValue = useCallback((value: string): string => {
    if (!value) return "Falta completar el RUN.";
    if (value.length < 7) return "RUN incompleto.";
    if (!isRunValid(value)) return "RUN inválido, verifica el dígito verificador.";
    return "";
  }, []);

  const syncRunError = useCallback(
    (value: string, force = false) => {
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
    },
    [runTouched, validateRunValue]
  );

  const validateBirthdate = useCallback((value: string): string => {
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
  }, []);

  const setBirthError = useCallback((message: string) => {
    setErrors((prev) => {
      if (message) {
        if (prev.fecha === message) return prev;
        return { ...prev, fecha: message };
      }
      if (!prev.fecha) return prev;
      const { fecha: _omit, ...rest } = prev;
      return rest;
    });
  }, []);

  const clampBirthdate = useCallback((value: string) => {
    if (!value) return "";
    const parsedBirth = parseLocalDate(value);
    if (!parsedBirth) return value;
    if (parsedBirth < MIN_BIRTHDATE_VALUE) return MIN_BIRTHDATE;
    if (parsedBirth > MAX_BIRTHDATE_VALUE) return MAX_BIRTHDATE;
    const age = computeAge(value);
    if (typeof age === "number" && age > MAX_AGE) return MIN_BIRTHDATE;
    return value;
  }, []);

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

  const regionOptions = useMemo(() => Object.keys(REGIONS).sort((a, b) => a.localeCompare(b, "es")), []);
  const comunaOptions = useMemo(() => {
    const list = REGIONS[region] || [];
    return list.slice().sort((a, b) => a.localeCompare(b, "es"));
  }, [region]);

  const focusField = (field: string) => {
    const map: Record<string, string> = {
      run: "run",
      nombres: "nombre",
      apellidos: "apellidos",
      email: "correo",
      fecha: "fnac",
      region: "region",
      comuna: "comuna",
      direccion: "direccion",
      pass: "pass",
      pass2: "pass2"
    };
    const targetId = map[field];
    if (!targetId) return;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus();
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};

    const runMessage = validateRunValue(runValue);
    if (runMessage) {
      next.run = runMessage;
    }
    const nombresNormalized = sanitizeNameInput(nombres).trim();
    const apellidosNormalized = sanitizeNameInput(apellidos).trim();
    if (nombres !== sanitizeNameInput(nombres)) {
      next.nombres = "El nombre no puede contener números ni símbolos.";
    } else if (!nombresNormalized) {
      next.nombres = "Falta completar los nombres.";
    } else if (nombresNormalized.length > 50) {
      next.nombres = "Máximo 50 caracteres.";
    }
    if (apellidos !== sanitizeNameInput(apellidos)) {
      next.apellidos = "Los apellidos no pueden contener números ni símbolos.";
    } else if (!apellidosNormalized) {
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

    if (Object.keys(next).length) {
      next.form = "Corrige los campos marcados antes de continuar.";
      setErrors(next);
      const orderedKeys: Array<keyof typeof next> = [
        "run",
        "nombres",
        "apellidos",
        "email",
        "fecha",
        "region",
        "comuna",
        "direccion",
        "pass",
        "pass2"
      ];
      const firstKey = orderedKeys.find((key) => Boolean(next[key]));
      if (firstKey) {
        focusField(firstKey as string);
      }
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const nombresNormalized = sanitizeNameInput(nombres).trim();
    const apellidosNormalized = sanitizeNameInput(apellidos).trim();

    const result = registerCustomer({
      run: runValue,
      tipo: "Cliente",
      nombre: nombresNormalized,
      apellidos: apellidosNormalized,
      email: email.trim(),
      fnac: fecha,
      region,
      comuna,
      direccion: direccion.trim(),
      phone: fono.trim(),
      pass,
      promoCode: promo.trim().toUpperCase() || undefined,
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

    window.alert("¡Registro exitoso! Sesión iniciada.");
    setErrors({});
    navigate("/", { replace: true });
  };

  return (
    <main className="container auth" style={{ padding: "32px 0 48px" }}>
      <section className="auth-hero">
        <h1 className="auth-hero__title font-brand">Pastelería Mil Sabores</h1>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">Registro de usuario</div>

        <form className="auth-form reg-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="run">RUN (sin puntos ni guion)</label>
            <input
              id="run"
              className={`form-control${errors.run ? " form-control--error" : ""}`}
              type="text"
              value={runDisplay}
              onChange={(event) => handleRunChange(event.target.value)}
              onBlur={handleRunBlur}
              onFocus={handleRunFocus}
              required
              autoComplete="off"
              aria-invalid={Boolean(errors.run)}
            />
            <small className={`help${errors.run ? " help--error" : ""}`}>{errors.run}</small>
          </div>

          <div className="form-group grid-2">
            <div>
              <label htmlFor="nombre">Nombres</label>
              <input
                id="nombre"
                className={`form-control${errors.nombres ? " form-control--error" : ""}`}
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
            <div>
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                className={`form-control${errors.apellidos ? " form-control--error" : ""}`}
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

          <div className="form-group grid-2">
            <div>
              <label htmlFor="correo">
                Correo <span className="small muted">(usa tu <b>@duoc.cl</b> si eres estudiante)</span>
              </label>
              <input
                id="correo"
                type="email"
                className={`form-control${errors.email ? " form-control--error" : ""}`}
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
            <div>
              <label htmlFor="fnac">Fecha de nacimiento (recomendado)</label>
              <input
                id="fnac"
                type="date"
                className={`form-control${errors.fecha ? " form-control--error" : ""}`}
                value={fecha}
                onChange={(event) => handleBirthdateChange(event.target.value)}
                onBlur={handleBirthdateBlur}
                min={MIN_BIRTHDATE}
                max={MAX_BIRTHDATE}
                required
                autoComplete="bday"
                aria-invalid={Boolean(errors.fecha)}
              />
              {errors.fecha && <small className="help help--error">{errors.fecha}</small>}
            </div>
          </div>

          <div className="form-group grid-2">
            <div>
              <label htmlFor="region">Región</label>
              <select
                id="region"
                className={`form-control${errors.region ? " form-control--error" : ""}`}
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value);
                  setComuna("");
                }}
                aria-invalid={Boolean(errors.region)}
              >
                <option value="">Seleccione</option>
                {regionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <small className={`help${errors.region ? " help--error" : ""}`}>{errors.region}</small>
            </div>
            <div>
              <label htmlFor="comuna">Comuna</label>
              <select
                id="comuna"
                className={`form-control${errors.comuna ? " form-control--error" : ""}`}
                value={comuna}
                onChange={(event) => setComuna(event.target.value)}
                disabled={!region}
                aria-invalid={Boolean(errors.comuna)}
              >
                <option value="">Seleccione</option>
                {comunaOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <small className={`help${errors.comuna ? " help--error" : ""}`}>{errors.comuna}</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <input
              id="direccion"
              className={`form-control${errors.direccion ? " form-control--error" : ""}`}
              type="text"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              maxLength={300}
              required
              autoComplete="street-address"
              aria-invalid={Boolean(errors.direccion)}
            />
            <small className={`help${errors.direccion ? " help--error" : ""}`}>{errors.direccion}</small>
          </div>

          <div className="form-group grid-2">
            <div>
              <label htmlFor="pass">Contraseña</label>
              <input
                id="pass"
                type="password"
                className={`form-control${errors.pass ? " form-control--error" : ""}`}
                value={pass}
                onChange={(event) => setPass(event.target.value)}
                minLength={8}
                maxLength={20}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(errors.pass)}
              />
              <small className={`help${errors.pass ? " help--error" : ""}`}>{errors.pass}</small>
            </div>
            <div>
              <label htmlFor="pass2">Confirmar contraseña</label>
              <input
                id="pass2"
                type="password"
                className={`form-control${errors.pass2 ? " form-control--error" : ""}`}
                value={pass2}
                onChange={(event) => setPass2(event.target.value)}
                minLength={8}
                maxLength={20}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(errors.pass2)}
              />
              <small className={`help${errors.pass2 ? " help--error" : ""}`}>{errors.pass2}</small>
            </div>
          </div>

          <div className="form-group grid-2">
            <div>
              <label htmlFor="fono">Teléfono (opcional)</label>
              <input
                id="fono"
                className="form-control"
                type="tel"
                value={fono}
                onChange={(event) => setFono(event.target.value.replace(/[^0-9+\s-]/g, ""))}
                maxLength={30}
                autoComplete="tel"
              />
              <small className="help">{errors.fono}</small>
            </div>
            <div>
              <label htmlFor="promo">Código de promoción (opcional)</label>
              <input
                id="promo"
                className="form-control"
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

          <div className="form-group">
            <label htmlFor="prefShip">Envío por defecto</label>
            <select
              id="prefShip"
              className="form-control"
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

          <div className="form-group">
            <div className="chk">
              <input
                id="prefNewsletter"
                type="checkbox"
                checked={newsletter}
                onChange={(event) => setNewsletter(event.target.checked)}
              />
              <label htmlFor="prefNewsletter">Quiero recibir promociones por email</label>
            </div>
            <div className="chk" style={{ marginTop: "8px" }}>
              <input
                id="prefSaveAddr"
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
              />
              <label htmlFor="prefSaveAddr">Guardar dirección para próximos pedidos</label>
            </div>
          </div>

          {errors.form && <p className="error" role="alert">{errors.form}</p>}

          <div className="form-actions">
            <button className="btn btn--primary" type="submit">
              Registrarse
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
