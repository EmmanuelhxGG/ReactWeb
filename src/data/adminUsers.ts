import type { AdminUser } from "../types";

export const BASE_ADMIN_USERS: AdminUser[] = [
  {
    run: "19011022K",
    nombre: "Juan",
    apellidos: "Pérez Soto",
    correo: "admin@duoc.cl",
    rol: "Administrador",
    region: "Región Metropolitana",
    comuna: "Santiago",
    direccion: "Av. Siempre Viva 123"
  },
  {
    run: "18022033K",
    nombre: "Ana",
    apellidos: "López Díaz",
    correo: "vendedor@duoc.cl",
    rol: "Vendedor",
    region: "Valparaíso",
    comuna: "Viña del Mar",
    direccion: "Calle Mar 456"
  },
  {
    run: "20033044K",
    nombre: "Luis",
    apellidos: "Ramírez Fuentes",
    correo: "cliente@gmail.com",
    rol: "Cliente",
    region: "Biobío",
    comuna: "Concepción",
    direccion: "Las Flores 789"
  }
];
