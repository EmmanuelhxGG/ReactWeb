import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { computeAge } from "../../utils/dates";
import { formatRun } from "../../utils/validators";
import type { AccountStatus } from "../../types";

export function AdminUsuariosPage() {
  const navigate = useNavigate();
  const { customers, adminUsers, setCustomerStatus, showNotification } = useAppContext();

  const resumenClientes = useMemo(() => {
    const total = customers.length;
    const newsletter = customers.filter((user) => user.prefs?.newsletter).length;
    const felices = customers.filter((user) => user.felices50).length;
    return { total, newsletter, felices };
  }, [customers]);

  const staffUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      const rol = user.rol?.toLowerCase() || "";
      return rol.includes("admin") || rol.includes("vendedor");
    });
  }, [adminUsers]);

  const extraClients = useMemo(() => {
    const staffEmails = new Set(staffUsers.map((user) => user.correo?.toLowerCase() ?? ""));
    return adminUsers.filter((user) => {
      const email = user.correo?.toLowerCase() ?? "";
      return !staffEmails.has(email);
    });
  }, [adminUsers, staffUsers]);

  const clientRows = useMemo(() => {
    type ClientRow = {
      key: string;
      nombre: string;
      apellidos: string;
      run: string;
      correo: string;
      region: string;
      comuna: string;
      edadLabel: string;
      beneficio: string;
      status: AccountStatus;
      statusLabel: string;
    };

    const rows = new Map<string, ClientRow>();

    customers.forEach((user) => {
      const age = computeAge(user.fnac);
      const benefits: string[] = [];
      if (typeof age === "number" && age >= 50) {
        benefits.push("Adulto Mayor");
      }
      if (user.felices50) {
        benefits.push("FELICES50 activo");
      }
      rows.set(user.email.toLowerCase(), {
        key: `cliente-${user.email}`,
        nombre: user.nombre,
        apellidos: user.apellidos,
        run: formatRun(user.run) || user.run || "-",
        correo: user.email,
        region: user.region,
        comuna: user.comuna,
        edadLabel: age ? `${age} años` : "Edad no registrada",
        beneficio: benefits.length ? benefits.join(" · ") : "Sin beneficio",
        status: (user.status as AccountStatus) === "inactive" ? "inactive" : "active",
        statusLabel: (user.status as AccountStatus) === "inactive" ? "Desactivado" : "Activo"
      });
    });

    extraClients.forEach((user) => {
      const key = user.correo?.toLowerCase() ?? "";
      if (!key || rows.has(key)) return;
      rows.set(key, {
        key: `staff-${user.correo}`,
        nombre: user.nombre,
        apellidos: user.apellidos,
        run: formatRun(user.run) || user.run || "-",
        correo: user.correo ?? "-",
        region: user.region || "-",
        comuna: user.comuna || "-",
        edadLabel: "Edad no registrada",
        beneficio: "Sin beneficio",
        status: "active",
        statusLabel: "Activo"
      });
    });

    return Array.from(rows.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [customers, extraClients]);

  const handleEditClient = (email: string) => {
    const user = customers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      showNotification({
        message: "No encontramos este cliente. Actualiza la lista e inténtalo otra vez.",
        kind: "error"
      });
      return;
    }

    navigate(
      `/admin/usuario-nuevo?tipo=cliente&id=${encodeURIComponent(user.id ?? user.email)}`,
      {
        state: {
          mode: "edit-customer",
          customerId: user.id ?? null,
          email
        }
      }
    );
  };

  const handleToggleStatus = (email: string) => {
    const target = customers.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (!target) return;
    const nextStatus: AccountStatus = (target.status as AccountStatus) === "inactive" ? "active" : "inactive";
    const deactivating = nextStatus === "inactive";
    showNotification({
      message: deactivating
        ? `¿Desactivar la cuenta de ${target.nombre}?`
        : `¿Reactivar la cuenta de ${target.nombre}?`,
      kind: deactivating ? "error" : "success",
      mode: "dialog",
      actionLabel: deactivating ? "Desactivar" : "Activar",
      cancelLabel: "Cancelar",
      onAction: () => {
        setCustomerStatus(email, nextStatus);
        showNotification({
          message: deactivating ? "Cuenta desactivada." : "Cuenta activada.",
          kind: "success",
          mode: "dialog",
          actionLabel: "Aceptar"
        });
      }
    });
  };

  return (
    <section className="admin-usuarios">
      <div className="admin-header" style={{ marginBottom: "20px" }}>
        <h2 className="admin-title" style={{ margin: 0 }}>Clientes & Staff</h2>
        <p className="muted" style={{ margin: "4px 0 0" }}>
          Staff: {staffUsers.length} personas · Clientes: {clientRows.length} registros · Newsletter activos: {resumenClientes.newsletter}
        </p>
      </div>

      <div className="admin-table-wrap" style={{ marginBottom: "32px" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th colSpan={6} style={{ textAlign: "left" }}>Equipo administrativo</th>
            </tr>
            <tr>
              <th>Nombre</th>
              <th>RUN</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Región</th>
              <th>Comuna</th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map((user) => (
              <tr key={user.correo}>
                <td>{user.nombre} {user.apellidos}</td>
                <td>{formatRun(user.run) || user.run || "-"}</td>
                <td>{user.correo}</td>
                <td>{user.rol}</td>
                <td>{user.region || "-"}</td>
                <td>{user.comuna || "-"}</td>
              </tr>
            ))}
            {!staffUsers.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                  No hay administradores ni vendedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th colSpan={6} style={{ textAlign: "left" }}>Clientes</th>
            </tr>
            <tr>
              <th>Nombre</th>
              <th>RUN</th>
              <th>Correo</th>
              <th>Región</th>
              <th>Comuna</th>
              <th>Beneficios</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientRows.map((row) => (
              <tr key={row.key}>
                <td>
                  <strong>{row.nombre} {row.apellidos}</strong>
                  <div className="muted small">{row.edadLabel}</div>
                </td>
                <td>{row.run}</td>
                <td>{row.correo}</td>
                <td>{row.region}</td>
                <td>{row.comuna}</td>
                <td>{row.beneficio}</td>
                <td>{row.statusLabel}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" type="button" onClick={() => handleEditClient(row.correo)}>
                      Editar
                    </button>
                    <button
                      className={row.status === "inactive" ? "btn-edit" : "btn-delete"}
                      type="button"
                      onClick={() => handleToggleStatus(row.correo)}
                    >
                      {row.status === "inactive" ? "Activar" : "Desactivar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!clientRows.length && (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center" }}>
                  Aún no se registran clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: "12px" }}>
          {resumenClientes.newsletter} inscritos al newsletter · {resumenClientes.felices} con beneficio FELICES50.
        </p>
      </div>
    </section>
  );
}
