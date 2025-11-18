import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { computeAge } from "../../utils/dates";
import { formatRun } from "../../utils/validators";

export function AdminUsuariosPage() {
  const { customers, adminUsers, upsertCustomer, removeCustomer } = useAppContext();

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
    const staffEmails = new Set(staffUsers.map((user) => user.correo.toLowerCase()));
    return adminUsers.filter((user) => !staffEmails.has(user.correo.toLowerCase()));
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
    };

    const rows = new Map<string, ClientRow>();

    customers.forEach((user) => {
      const age = computeAge(user.fnac);
      rows.set(user.email.toLowerCase(), {
        key: `cliente-${user.email}`,
        nombre: user.nombre,
        apellidos: user.apellidos,
        run: formatRun(user.run) || user.run || "-",
        correo: user.email,
        region: user.region,
        comuna: user.comuna,
        edadLabel: age ? `${age} años` : "Edad no registrada",
        beneficio: user.felices50 ? "FELICES50 activo" : "Sin beneficio"
      });
    });

    extraClients.forEach((user) => {
      const key = user.correo.toLowerCase();
      if (rows.has(key)) return;
      rows.set(key, {
        key: `staff-${user.correo}`,
        nombre: user.nombre,
        apellidos: user.apellidos,
        run: formatRun(user.run) || user.run || "-",
        correo: user.correo,
        region: user.region || "-",
        comuna: user.comuna || "-",
        edadLabel: "Edad no registrada",
        beneficio: "Sin beneficio"
      });
    });

    return Array.from(rows.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [customers, extraClients]);

  const handleEditClient = (email: string) => {
    const user = customers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;
    const nombre = window.prompt("Nombre:", user.nombre) || user.nombre;
    const apellidos = window.prompt("Apellidos:", user.apellidos) || user.apellidos;
    const region = window.prompt("Región:", user.region || "") || user.region || "";
    const comuna = window.prompt("Comuna:", user.comuna || "") || user.comuna || "";
    upsertCustomer({
      ...user,
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      region: region.trim() || user.region || "",
      comuna: comuna.trim() || user.comuna || ""
    });
  };

  const handleDeleteClient = (email: string) => {
    if (!window.confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
    removeCustomer(email);
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
                <td>
                  <div className="table-actions">
                    <button className="btn-edit" type="button" onClick={() => handleEditClient(row.correo)}>
                      Editar
                    </button>
                    <button className="btn-delete" type="button" onClick={() => handleDeleteClient(row.correo)}>
                      Eliminar
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
