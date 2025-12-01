import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useRegions } from "../hooks/useRegions";
import { computeAge } from "../utils/dates";
import { describeBenefitLabel, formatMoney } from "../utils/format";
import { formatRun } from "../utils/validators";

const SHIPPING_OPTIONS = [
  { value: 3000, label: "Envío urbano ($3.000)" },
  { value: 6000, label: "Envío regional ($6.000)" }
];

const ADDRESS_LIMIT = 5;
const createAddressId = () => `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

type AddressDraft = {
  id: string;
  alias: string;
  direccion: string;
  region: string;
  comuna: string;
  referencia: string;
  createdAt: number;
};

const NAME_SANITIZE_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g;

const normalizeNameInput = (value: string) =>
  value.replace(NAME_SANITIZE_REGEX, " ").replace(/\s{2,}/g, " ");

export function PerfilPage() {
  const navigate = useNavigate();
  const { customerSession, currentCustomer, updateCustomer, logoutCustomer, showNotification, orders } = useAppContext();
  const { regions: regionsMap, loading: regionsLoading, error: regionsError } = useRegions();

  const currentUser = currentCustomer;
  const accountStatus = currentUser?.status === "inactive" ? "Desactivada" : "Activada";
  const accountStatusLegend = currentUser?.status === "inactive"
    ? "Tu cuenta está temporalmente desactivada por el equipo administrativo."
    : "Tu cuenta está activa y lista para comprar.";
  const accountStatusClass = `profile-account-status ${currentUser?.status === "inactive" ? "profile-account-status--inactive" : "profile-account-status--active"}`;

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    direccion: "",
    region: "",
    comuna: "",
    phone: "",
    promoCode: "",
    defaultShip: SHIPPING_OPTIONS[0].value,
    newsletter: false,
    saveAddress: false,
    addressAlias: "Dirección principal",
    addressReferencia: "",
    primaryAddressId: "",
    primaryAddressCreatedAt: 0
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [extraAddresses, setExtraAddresses] = useState<AddressDraft[]>([]);
  const [extraErrors, setExtraErrors] = useState<Record<string, string>>({});

  const resetProfileForm = useCallback(() => {
    if (!currentUser) return;
    const addresses = currentUser.prefs?.addresses ?? [];
    const primaryStored =
      addresses.find((address) => address.id === currentUser.prefs?.primaryAddressId) ||
      addresses[0];
    const fallbackId = primaryStored?.id || currentUser.prefs?.primaryAddressId || createAddressId();
    const primaryDraft: AddressDraft = primaryStored
      ? {
          id: primaryStored.id,
          alias: primaryStored.alias || "Dirección principal",
          direccion: primaryStored.direccion,
          region: primaryStored.region,
          comuna: primaryStored.comuna,
          referencia: primaryStored.referencia || "",
          createdAt: primaryStored.createdAt
        }
      : {
          id: fallbackId,
          alias: "Dirección principal",
          direccion: currentUser.direccion || "",
          region: currentUser.region || "",
          comuna: currentUser.comuna || "",
          referencia: "",
          createdAt: currentUser.createdAt
        };

    const others = addresses
      .filter((address) => address.id !== primaryDraft.id)
      .map<AddressDraft>((address) => ({
        id: address.id,
        alias: address.alias || "",
        direccion: address.direccion,
        region: address.region,
        comuna: address.comuna,
        referencia: address.referencia || "",
        createdAt: address.createdAt
      }));

    setForm({
      nombre: normalizeNameInput(currentUser.nombre || ""),
      apellidos: normalizeNameInput(currentUser.apellidos || ""),
      direccion: primaryDraft.direccion,
      region: primaryDraft.region,
      comuna: primaryDraft.comuna,
      phone: currentUser.phone || "",
      promoCode: currentUser.promoCode || "",
      defaultShip: currentUser.prefs?.defaultShip ?? SHIPPING_OPTIONS[0].value,
      newsletter: Boolean(currentUser.prefs?.newsletter),
      saveAddress: Boolean(currentUser.prefs?.saveAddress),
      addressAlias: primaryDraft.alias || "Dirección principal",
      addressReferencia: primaryDraft.referencia,
      primaryAddressId: primaryDraft.id,
      primaryAddressCreatedAt: primaryDraft.createdAt
    });
    setExtraAddresses(others);
    setErrors({});
    setExtraErrors({});
  }, [currentUser]);

  useEffect(() => {
    resetProfileForm();
  }, [resetProfileForm]);

  const regionOptions = useMemo(
    () => Object.keys(regionsMap).sort((a, b) => a.localeCompare(b, "es")),
    [regionsMap]
  );
  const comunaOptions = useMemo(() => {
    const list = regionsMap[form.region] || [];
    return list.slice().sort((a, b) => a.localeCompare(b, "es"));
  }, [form.region, regionsMap]);

  useEffect(() => {
    if (!regionsLoading && form.region && !regionsMap[form.region]) {
      setForm((prev) => ({ ...prev, region: "", comuna: "" }));
    }
  }, [regionsLoading, regionsMap, form.region]);

  useEffect(() => {
    if (!regionsLoading && form.comuna && !comunaOptions.includes(form.comuna)) {
      setForm((prev) => ({ ...prev, comuna: "" }));
    }
  }, [regionsLoading, comunaOptions, form.comuna]);

  useEffect(() => {
    if (regionsLoading || !extraAddresses.length) return;
    let changed = false;
    const sanitized = extraAddresses.map((address) => {
      const regionCommunes = regionsMap[address.region] || [];
      if (address.region && !regionsMap[address.region]) {
        changed = true;
        return { ...address, region: "", comuna: "" };
      }
      if (address.comuna && !regionCommunes.includes(address.comuna)) {
        changed = true;
        return { ...address, comuna: "" };
      }
      return address;
    });
    if (changed) {
      setExtraAddresses(sanitized);
    }
  }, [extraAddresses, regionsLoading, regionsMap]);

  const handleExtraChange = (id: string, field: "alias" | "direccion" | "region" | "comuna" | "referencia", value: string) => {
    setExtraAddresses((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        if (field === "region") {
          return {
            ...entry,
            region: value,
            comuna: entry.region === value ? entry.comuna : ""
          };
        }
        return { ...entry, [field]: value };
      })
    );
    setExtraErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleRemoveExtra = (id: string) => {
    setExtraAddresses((prev) => prev.filter((entry) => entry.id !== id));
    setExtraErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handlePrimaryChange = (id: string) => {
    if (id === form.primaryAddressId) return;
    const target = extraAddresses.find((entry) => entry.id === id);
    if (!target) return;
    const now = Date.now();
    const snapshot: AddressDraft = {
      id: form.primaryAddressId || createAddressId(),
      alias: form.addressAlias || "Dirección principal",
      direccion: form.direccion,
      region: form.region,
      comuna: form.comuna,
      referencia: form.addressReferencia,
      createdAt: form.primaryAddressCreatedAt || now
    };
    setExtraAddresses((prev) => {
      const filtered = prev.filter((entry) => entry.id !== id);
      if (snapshot.direccion.trim()) {
        filtered.push({
          ...snapshot,
          referencia: snapshot.referencia || ""
        });
      }
      return filtered;
    });
    setForm((prev) => ({
      ...prev,
      direccion: target.direccion,
      region: target.region,
      comuna: target.comuna,
      addressAlias: target.alias || "Dirección principal",
      addressReferencia: target.referencia || "",
      primaryAddressId: target.id,
      primaryAddressCreatedAt: target.createdAt || now
    }));
    setExtraErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addExtraAddress = () => {
    if (extraAddresses.length >= ADDRESS_LIMIT - 1) {
      showNotification({ message: "Puedes guardar hasta 5 direcciones.", kind: "info" });
      return;
    }
    const now = Date.now();
    setExtraAddresses((prev) => [
      ...prev,
      {
        id: createAddressId(),
        alias: "",
        direccion: "",
        region: "",
        comuna: "",
        referencia: "",
        createdAt: now
      }
    ]);
  };

  const defaultShipLabel = useMemo(() => {
    const value = currentUser?.prefs?.defaultShip ?? SHIPPING_OPTIONS[0].value;
    return SHIPPING_OPTIONS.find((option) => option.value === value)?.label || SHIPPING_OPTIONS[0].label;
  }, [currentUser]);

  const customerOrders = useMemo(() => {
    if (!customerSession) return [];
    const email = customerSession.email.toLowerCase();
    const name = (customerSession.nombre || "").trim().toLowerCase();
    return orders
      .filter((order) => {
        const orderEmail = (order.customerEmail || "").toLowerCase();
        const customerField = (order.cliente || "").trim().toLowerCase();
        if (orderEmail && orderEmail === email) {
          return true;
        }
        if (customerField === email) {
          return true;
        }
        if (name && customerField === name) {
          return true;
        }
        return false;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [customerSession, orders]);

  if (!customerSession) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return (
      <main className="container" style={{ padding: "48px 0" }}>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <p className="muted">Cargando información de tu cuenta...</p>
        </div>
      </main>
    );
  }

  const age = computeAge(currentUser.fnac);
  const runLabel = formatRun(currentUser.run) || currentUser.run || "Sin RUN registrado";
  const benefitLabel = currentUser.felices50 ? "Beneficio FELICES50 activo" : "Sin beneficio permanente";
  const birthdayLabel = currentUser.fnac
    ? new Date(currentUser.fnac).toLocaleDateString()
    : "Sin fecha registrada";
  const registrationLabel = new Date(currentUser.createdAt).toLocaleDateString();
  const primaryAddress =
    currentUser.prefs?.addresses?.find((address) => address.id === currentUser.prefs?.primaryAddressId) ||
    currentUser.prefs?.addresses?.[0] ||
    null;
  const addressLine = primaryAddress
    ? [primaryAddress.direccion, primaryAddress.comuna, primaryAddress.region].filter(Boolean).join(", ")
    : [currentUser.direccion, currentUser.comuna, currentUser.region].filter(Boolean).join(", ") || "Sin dirección registrada";
  const addressCount = currentUser.prefs?.addresses?.length ?? (addressLine !== "Sin dirección registrada" ? 1 : 0);
  const extraAddressLabel = addressCount > 1 ? ` · ${addressCount - 1} adicionales` : "";
  const phoneLabel = currentUser.phone || "Sin teléfono registrado";
  const newsletterLabel = currentUser.prefs?.newsletter ? "Sí" : "No";
  const saveAddressLabel = currentUser.prefs?.saveAddress ? "Sí" : "No";

  const focusProfileField = (field: string) => {
    const map: Record<string, string> = {
      nombre: "profileNombre",
      apellidos: "profileApellidos",
      direccion: "profileDireccion",
      region: "profileRegion",
      comuna: "profileComuna",
      addressAlias: "profileAlias",
      addressReferencia: "profileReferencia",
      promoCode: "profilePromo"
    };
    const target = map[field];
    if (!target) return;
    requestAnimationFrame(() => {
      document.getElementById(target)?.focus();
    });
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    const normalizedNombre = normalizeNameInput(form.nombre).trim();
    const normalizedApellidos = normalizeNameInput(form.apellidos).trim();
    const primaryAlias = form.addressAlias.trim();
    const primaryReference = form.addressReferencia.trim();

    if (!normalizedNombre) {
      nextErrors.nombre = "Falta completar los nombres.";
    } else if (normalizedNombre.length > 50) {
      nextErrors.nombre = "Máximo 50 caracteres.";
    }
    if (!normalizedApellidos) {
      nextErrors.apellidos = "Falta completar los apellidos.";
    } else if (normalizedApellidos.length > 100) {
      nextErrors.apellidos = "Máximo 100 caracteres.";
    }
    if (!form.direccion.trim()) {
      nextErrors.direccion = "Falta completar la dirección.";
    } else if (form.direccion.trim().length > 300) {
      nextErrors.direccion = "Máximo 300 caracteres.";
    }
    if (!form.region) {
      nextErrors.region = "Falta seleccionar una región.";
    }
    if (!form.comuna) {
      nextErrors.comuna = "Falta seleccionar una comuna.";
    }
    if (form.promoCode && form.promoCode.length > 20) {
      nextErrors.promoCode = "Máximo 20 caracteres.";
    }
    if (primaryAlias.length > 60) {
      nextErrors.addressAlias = "Máximo 60 caracteres.";
    }
    if (primaryReference.length > 120) {
      nextErrors.addressReferencia = "Máximo 120 caracteres.";
    }

    const addressIssues: Record<string, string> = {};
    extraAddresses.forEach((address) => {
      const trimmedAlias = address.alias.trim();
      const trimmedDireccion = address.direccion.trim();
      const trimmedRef = address.referencia.trim();
      if (!trimmedDireccion) {
        addressIssues[address.id] = "Falta la dirección.";
        return;
      }
      if (!address.region) {
        addressIssues[address.id] = "Selecciona una región.";
        return;
      }
      if (!address.comuna) {
        addressIssues[address.id] = "Selecciona una comuna.";
        return;
      }
      if (trimmedAlias.length > 60) {
        addressIssues[address.id] = "El nombre es demasiado largo.";
        return;
      }
      if (trimmedRef.length > 120) {
        addressIssues[address.id] = "La referencia es demasiado larga.";
      }
    });

    if (Object.keys(nextErrors).length || Object.keys(addressIssues).length) {
      setErrors(nextErrors);
      setExtraErrors(addressIssues);
      const ordered: Array<keyof typeof nextErrors> = [
        "nombre",
        "apellidos",
        "direccion",
        "region",
        "comuna",
        "addressAlias",
        "addressReferencia",
        "promoCode"
      ];
      const first = ordered.find((key) => Boolean(nextErrors[key]));
      if (first) {
        focusProfileField(first as string);
      }
      return;
    }
    setErrors({});
    setExtraErrors({});

    const promoCode = form.promoCode.trim().toUpperCase();
    const shipValue = SHIPPING_OPTIONS.some((option) => option.value === form.defaultShip)
      ? form.defaultShip
      : SHIPPING_OPTIONS[0].value;
    const now = Date.now();
    const primaryId = form.primaryAddressId || createAddressId();
    const primaryAddress = {
      id: primaryId,
      alias: primaryAlias || undefined,
      direccion: form.direccion.trim(),
      region: form.region,
      comuna: form.comuna,
      referencia: primaryReference || undefined,
      createdAt: form.primaryAddressCreatedAt || now,
      updatedAt: now
    };
    const extrasPayload = extraAddresses.map((address) => {
      const trimmedAlias = address.alias.trim();
      const trimmedRef = address.referencia.trim();
      return {
        id: address.id || createAddressId(),
        alias: trimmedAlias || undefined,
        direccion: address.direccion.trim(),
        region: address.region,
        comuna: address.comuna,
        referencia: trimmedRef || undefined,
        createdAt: address.createdAt || now,
        updatedAt: now
      };
    });
    const addressesPayload = [primaryAddress, ...extrasPayload].slice(0, ADDRESS_LIMIT);

    const result = await updateCustomer({
      nombre: normalizedNombre,
      apellidos: normalizedApellidos,
      direccion: primaryAddress.direccion,
      region: primaryAddress.region,
      comuna: primaryAddress.comuna,
      phone: form.phone.trim() || undefined,
      promoCode,
      prefs: {
        defaultShip: shipValue,
        newsletter: form.newsletter,
        saveAddress: form.saveAddress,
        addresses: addressesPayload,
        primaryAddressId: primaryAddress.id
      }
    });
    if (!result.ok) {
      showNotification({ message: result.message ?? "No pudimos actualizar tus datos", kind: "error" });
      return;
    }
    showNotification({ message: "Datos actualizados correctamente.", kind: "success" });
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};

    if (!passwordForm.current) {
      next.current = "Ingresa tu contraseña actual.";
    } else if (passwordForm.current !== currentUser.pass) {
      next.current = "Contraseña actual incorrecta.";
    }

    if (!passwordForm.next) {
      next.next = "Ingresa una nueva contraseña.";
    } else if (passwordForm.next.length < 4 || passwordForm.next.length > 10) {
      next.next = "Debe tener entre 4 y 10 caracteres.";
    }

    if (passwordForm.confirm !== passwordForm.next) {
      next.confirm = "Debe coincidir.";
    }

    if (Object.keys(next).length) {
      setPassErrors(next);
      return;
    }

    setPassErrors({});
    const result = await updateCustomer({ pass: passwordForm.next });
    if (!result.ok) {
      showNotification({ message: result.message ?? "No pudimos actualizar tu contraseña", kind: "error" });
      return;
    }
    setPasswordForm({ current: "", next: "", confirm: "" });
    showNotification({ message: "Contraseña actualizada.", kind: "success" });
  };

  const handleLogout = async () => {
    setIsEditing(false);
    await logoutCustomer();
    navigate("/", { replace: true });
  };

  const startEdit = () => {
    resetProfileForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetProfileForm();
    setIsEditing(false);
  };

  return (
    <main className="container" style={{ padding: "32px 0 48px" }}>
      <div className="profile-page">
        <header className="profile-header">
          <div>
            <h1 className="section-title font-brand profile-header__title">Mi perfil</h1>
            <p className="muted">
              RUN <strong>{runLabel}</strong> · Registrado el {registrationLabel}
            </p>
          </div>
          <div className="profile-actions profile-actions--right">
            {!isEditing ? (
              <button className="btn btn--primary" type="button" onClick={startEdit}>
                Modificar datos
              </button>
            ) : (
              <button className="btn" type="button" onClick={handleCancelEdit}>
                Cancelar edición
              </button>
            )}
          </div>
        </header>

        <section className="profile-content">
          {!isEditing ? (
            <article className="profile-summary profile-view-card active">
              <div className="profile-summary__meta">
                <p className="profile-inline">{currentUser.email}</p>
                <p className="profile-inline">
                  {age ? `${age} años` : "Sin fecha registrada"} · {benefitLabel}
                  {currentUser.promoCode ? ` · Cupón: ${currentUser.promoCode}` : ""}
                </p>
              </div>

              <p className="profile-inline muted">Aplicaremos automáticamente los beneficios disponibles para tus compras.</p>

              <ul className="profile-summary__list">
                <li>
                  <strong>Cumpleaños</strong>
                  <span>{birthdayLabel}</span>
                </li>
                <li>
                  <strong>Dirección</strong>
                  <span>{addressLine}{extraAddressLabel}</span>
                </li>
                <li>
                  <strong>Teléfono</strong>
                  <span>{phoneLabel}</span>
                </li>
                <li>
                  <strong>Envío preferido</strong>
                  <span>{defaultShipLabel}</span>
                </li>
                <li>
                  <strong>Novedades</strong>
                  <span>{newsletterLabel}</span>
                </li>
                <li>
                  <strong>Recordar dirección</strong>
                  <span>{saveAddressLabel}</span>
                </li>
              </ul>

              <div className="profile-summary__note">
                Mantén tus datos actualizados para agilizar las compras y recibir beneficios especiales.
              </div>

              <div className={accountStatusClass}>
                <div>
                  <span>Estado de la cuenta</span>
                  <p className="small muted" style={{ margin: "4px 0 0" }}>{accountStatusLegend}</p>
                </div>
                <span className="profile-account-status__indicator">{accountStatus}</span>
              </div>

              <div className="profile-actions profile-actions--right">
                <Link className="btn" to="/carrito">
                  Revisar carrito
                </Link>
                <button className="btn btn--ghost" type="button" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </article>
          ) : (
            <article className="profile-edit profile-view-card active">
              <header>
                <h2 className="profile-card__title">Modificar mis datos</h2>
                <p className="profile-inline">Revisa que todos los campos estén completos antes de guardar.</p>
              </header>

              <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
                <div className="profile-field-row">
                  <div className="profile-field">
                    <label htmlFor="profileNombre">Nombres</label>
                    <input
                      id="profileNombre"
                      className={`form-control${errors.nombre ? " form-control--error" : ""}`}
                      type="text"
                      value={form.nombre}
                      onChange={(event) => setForm((prev) => ({ ...prev, nombre: normalizeNameInput(event.target.value) }))}
                      maxLength={50}
                      required
                      aria-invalid={Boolean(errors.nombre)}
                    />
                    <small className={`help${errors.nombre ? " help--error" : ""}`}>{errors.nombre}</small>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profileApellidos">Apellidos</label>
                    <input
                      id="profileApellidos"
                      className={`form-control${errors.apellidos ? " form-control--error" : ""}`}
                      type="text"
                      value={form.apellidos}
                      onChange={(event) => setForm((prev) => ({ ...prev, apellidos: normalizeNameInput(event.target.value) }))}
                      maxLength={100}
                      required
                      aria-invalid={Boolean(errors.apellidos)}
                    />
                    <small className={`help${errors.apellidos ? " help--error" : ""}`}>{errors.apellidos}</small>
                  </div>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label htmlFor="profileAlias">Nombre para la dirección (opcional)</label>
                    <input
                      id="profileAlias"
                      className={`form-control${errors.addressAlias ? " form-control--error" : ""}`}
                      type="text"
                      value={form.addressAlias}
                      onChange={(event) => setForm((prev) => ({ ...prev, addressAlias: event.target.value }))}
                      maxLength={60}
                      aria-invalid={Boolean(errors.addressAlias)}
                    />
                    <small className={`help${errors.addressAlias ? " help--error" : ""}`}>{errors.addressAlias}</small>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profileReferencia">Referencia (opcional)</label>
                    <input
                      id="profileReferencia"
                      className={`form-control${errors.addressReferencia ? " form-control--error" : ""}`}
                      type="text"
                      value={form.addressReferencia}
                      onChange={(event) => setForm((prev) => ({ ...prev, addressReferencia: event.target.value }))}
                      maxLength={120}
                      aria-invalid={Boolean(errors.addressReferencia)}
                    />
                    <small className={`help${errors.addressReferencia ? " help--error" : ""}`}>{errors.addressReferencia}</small>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profileDireccion">Dirección</label>
                  <input
                    id="profileDireccion"
                    className={`form-control${errors.direccion ? " form-control--error" : ""}`}
                    type="text"
                    value={form.direccion}
                    onChange={(event) => setForm((prev) => ({ ...prev, direccion: event.target.value }))}
                    maxLength={300}
                    required
                    aria-invalid={Boolean(errors.direccion)}
                  />
                  <small className={`help${errors.direccion ? " help--error" : ""}`}>{errors.direccion}</small>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label htmlFor="profileRegion">Región</label>
                    <select
                      id="profileRegion"
                      className={`form-control${errors.region ? " form-control--error" : ""}`}
                      value={form.region}
                      onChange={(event) => {
                        const value = event.target.value;
                        setForm((prev) => ({
                          ...prev,
                          region: value,
                          comuna: value === prev.region ? prev.comuna : ""
                        }));
                      }}
                      disabled={regionsLoading}
                      aria-invalid={Boolean(errors.region || regionsError)}
                    >
                      <option value="" disabled={regionsLoading}>
                        {regionsLoading ? "Cargando regiones..." : "Seleccione"}
                      </option>
                      {regionOptions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    <small className={`help${errors.region || regionsError ? " help--error" : ""}`}>
                      {errors.region || regionsError || ""}
                    </small>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profileComuna">Comuna</label>
                    <select
                      id="profileComuna"
                      className={`form-control${errors.comuna ? " form-control--error" : ""}`}
                      value={form.comuna}
                      onChange={(event) => setForm((prev) => ({ ...prev, comuna: event.target.value }))}
                      disabled={regionsLoading || !form.region}
                      aria-invalid={Boolean(errors.comuna)}
                    >
                      <option value="">
                        {regionsLoading ? "Cargando comunas..." : "Seleccione"}
                      </option>
                      {comunaOptions.map((comuna) => (
                        <option key={comuna} value={comuna}>
                          {comuna}
                        </option>
                      ))}
                    </select>
                    <small className={`help${errors.comuna ? " help--error" : ""}`}>{errors.comuna}</small>
                  </div>
                </div>

                <section className="profile-addresses">
                  <header className="profile-addresses__head">
                    <h3 className="profile-card__subtitle">Direcciones adicionales</h3>
                    <span className="muted small">Puedes guardar hasta {ADDRESS_LIMIT} direcciones en total.</span>
                  </header>

                  {extraAddresses.length === 0 ? (
                    <p className="muted small">No tienes direcciones adicionales guardadas.</p>
                  ) : (
                    extraAddresses.map((address, index) => {
                      const communes = (regionsMap[address.region] || []).slice().sort((a, b) => a.localeCompare(b, "es"));
                      return (
                        <div className="profile-address-card" key={address.id}>
                          <div className="profile-address-card__head">
                            <strong>Dirección #{index + 2}</strong>
                            <div className="profile-address-card__actions">
                              <button
                                className="btn btn--ghost btn-sm"
                                type="button"
                                onClick={() => handlePrimaryChange(address.id)}
                              >
                                Usar como principal
                              </button>
                              <button
                                className="btn btn--ghost btn-sm"
                                type="button"
                                onClick={() => handleRemoveExtra(address.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                          <div className="profile-field-row">
                            <div className="profile-field">
                              <label>Nombre (opcional)</label>
                              <input
                                className="form-control"
                                type="text"
                                value={address.alias}
                                onChange={(event) => handleExtraChange(address.id, "alias", event.target.value)}
                                maxLength={60}
                              />
                            </div>
                            <div className="profile-field">
                              <label>Referencia (opcional)</label>
                              <input
                                className="form-control"
                                type="text"
                                value={address.referencia}
                                onChange={(event) => handleExtraChange(address.id, "referencia", event.target.value)}
                                maxLength={120}
                              />
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Dirección</label>
                            <input
                              className="form-control"
                              type="text"
                              value={address.direccion}
                              onChange={(event) => handleExtraChange(address.id, "direccion", event.target.value)}
                              maxLength={300}
                            />
                          </div>
                          <div className="profile-field-row">
                            <div className="profile-field">
                              <label>Región</label>
                              <select
                                className="form-control"
                                value={address.region}
                                onChange={(event) => handleExtraChange(address.id, "region", event.target.value)}
                                disabled={regionsLoading}
                              >
                                <option value="" disabled={regionsLoading}>
                                  {regionsLoading ? "Cargando regiones..." : "Seleccione"}
                                </option>
                                {regionOptions.map((region) => (
                                  <option key={region} value={region}>
                                    {region}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="profile-field">
                              <label>Comuna</label>
                              <select
                                className="form-control"
                                value={address.comuna}
                                onChange={(event) => handleExtraChange(address.id, "comuna", event.target.value)}
                                disabled={regionsLoading || !address.region}
                              >
                                <option value="">
                                  {regionsLoading ? "Cargando comunas..." : "Seleccione"}
                                </option>
                                {communes.map((comuna) => (
                                  <option key={comuna} value={comuna}>
                                    {comuna}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <small className={`help${extraErrors[address.id] ? " help--error" : ""}`}>{extraErrors[address.id] || ""}</small>
                        </div>
                      );
                    })
                  )}

                  <button
                    className="btn btn--ghost btn-sm"
                    type="button"
                    onClick={addExtraAddress}
                    disabled={regionsLoading || extraAddresses.length >= ADDRESS_LIMIT - 1}
                  >
                    Añadir dirección
                  </button>
                </section>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label htmlFor="profilePhone">Teléfono</label>
                    <input
                      id="profilePhone"
                      className="form-control"
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value.replace(/[^0-9+\s-]/g, "") }))}
                      maxLength={30}
                    />
                    <small className={`help${errors.phone ? " help--error" : ""}`}>{errors.phone}</small>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profilePromo">Código de promoción</label>
                    <input
                      id="profilePromo"
                      className={`form-control${errors.promoCode ? " form-control--error" : ""}`}
                      type="text"
                      value={form.promoCode}
                      onChange={(event) => setForm((prev) => ({ ...prev, promoCode: event.target.value.toUpperCase() }))}
                      maxLength={20}
                      aria-invalid={Boolean(errors.promoCode)}
                    />
                    <small className={`help${errors.promoCode ? " help--error" : ""}`}>{errors.promoCode}</small>
                  </div>
                </div>

                <div className="profile-field-row">
                  <div className="profile-field">
                    <label htmlFor="profileShip">Envío por defecto</label>
                    <select
                      id="profileShip"
                      className="form-control"
                      value={form.defaultShip}
                      onChange={(event) => setForm((prev) => ({ ...prev, defaultShip: Number(event.target.value) }))}
                    >
                      {SHIPPING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="profile-field-row">
                  <div className="chk">
                    <input
                      id="profileNewsletter"
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={(event) => setForm((prev) => ({ ...prev, newsletter: event.target.checked }))}
                    />
                    <label htmlFor="profileNewsletter">Recibir novedades y descuentos</label>
                  </div>
                  <div className="chk">
                    <input
                      id="profileSaveAddress"
                      type="checkbox"
                      checked={form.saveAddress}
                      onChange={(event) => setForm((prev) => ({ ...prev, saveAddress: event.target.checked }))}
                    />
                    <label htmlFor="profileSaveAddress">Recordar dirección para próximos pedidos</label>
                  </div>
                </div>

                <div className="form-actions form-actions--split">
                  <button className="btn btn--primary" type="submit">
                    Guardar cambios
                  </button>
                  <button className="btn" type="button" onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                </div>
              </form>
            </article>
          )}

          {!isEditing && (
            <article className="profile-orders profile-view-card active">
              <h2 className="profile-card__title">Historial de pedidos</h2>
              <p className="muted small" style={{ marginBottom: "16px" }}>
                Revisa tus compras anteriores y el estado que mantiene cada pedido.
              </p>
              {customerOrders.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>Pedido</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>Fecha</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>Descuento</th>
                        <th style={{ textAlign: "right", padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>Total</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOrders.map((order) => {
                        const dateLabel = new Date(order.createdAt).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        });
                        const reasonList: string[] = [];
                        order.benefitsApplied?.forEach((label) => {
                          const detail = describeBenefitLabel(label);
                          reasonList.push(detail.detail ? `${detail.title} — ${detail.detail}` : detail.title);
                        });
                        if (order.couponCode) {
                          reasonList.push(`Cupón ${order.couponCode}${order.couponLabel ? ` — ${order.couponLabel}` : ""}`);
                        }
                        if (!reasonList.length && order.discountTotal > 0) {
                          reasonList.push("Ajuste de precio aplicado");
                        }
                        const hasDiscount = reasonList.length > 0;
                        return (
                          <tr key={order.id}>
                            <td style={{ padding: "10px 12px", borderBottom: "1px solid #f7f7f7" }}>
                              <strong>{order.orderCode ?? order.id}</strong>
                            </td>
                            <td style={{ padding: "10px 12px", borderBottom: "1px solid #f7f7f7" }}>
                              {dateLabel}
                            </td>
                            <td style={{ padding: "10px 12px", borderBottom: "1px solid #f7f7f7" }}>
                              <span>{hasDiscount ? "Sí" : "No"}</span>
                              {hasDiscount && (
                                <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                                  {reasonList.map((reason, index) => (
                                    <li key={`${order.id}-reason-${index}`} className="muted small">
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                            <td style={{ padding: "10px 12px", borderBottom: "1px solid #f7f7f7", textAlign: "right" }}>
                              {formatMoney(order.total)}
                            </td>
                            <td style={{ padding: "10px 12px", borderBottom: "1px solid #f7f7f7" }}>
                              {order.estado}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted small">Todavía no registras pedidos en tu cuenta.</p>
              )}
            </article>
          )}

          <article className="profile-edit card profile-pass-panel">
            <h2 className="profile-card__title">Cambiar contraseña</h2>
            <form className="profile-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="profilePassCurrent">Contraseña actual</label>
                <input
                  id="profilePassCurrent"
                  className={`form-control${passErrors.current ? " form-control--error" : ""}`}
                  type="password"
                  value={passwordForm.current}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
                  maxLength={10}
                  required
                  aria-invalid={Boolean(passErrors.current)}
                />
                <small className={`help${passErrors.current ? " help--error" : ""}`}>{passErrors.current}</small>
              </div>
              <div className="form-group grid-2">
                <div>
                  <label htmlFor="profilePassNew">Nueva contraseña</label>
                  <input
                    id="profilePassNew"
                    className={`form-control${passErrors.next ? " form-control--error" : ""}`}
                    type="password"
                    value={passwordForm.next}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
                    maxLength={10}
                    required
                    aria-invalid={Boolean(passErrors.next)}
                  />
                  <small className={`help${passErrors.next ? " help--error" : ""}`}>{passErrors.next}</small>
                </div>
                <div>
                  <label htmlFor="profilePassConfirm">Confirmar contraseña</label>
                  <input
                    id="profilePassConfirm"
                    className={`form-control${passErrors.confirm ? " form-control--error" : ""}`}
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
                    maxLength={10}
                    required
                    aria-invalid={Boolean(passErrors.confirm)}
                  />
                  <small className={`help${passErrors.confirm ? " help--error" : ""}`}>{passErrors.confirm}</small>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn" type="submit">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </article>
        </section>
      </div>
    </main>
  );
}
