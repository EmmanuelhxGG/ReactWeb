import type { Product } from "../types";

export const BASE_PRODUCTS: Product[] = [
  {
    id: "TC001",
    nombre: "Torta Cuadrada de Chocolate",
    precio: 45000,
    categoria: "Tortas Cuadradas",
    attr: "20 porciones",
    img: "/img/Torta Cuadrada de Chocolate.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Deliciosa torta de chocolate con capas de ganache y un toque de avellanas. Personalizable con mensajes especiales."
  },
  {
    id: "TC002",
    nombre: "Torta Cuadrada de Frutas",
    precio: 50000,
    categoria: "Tortas Cuadradas",
    attr: "Frutas frescas",
    img: "/img/Torta Cuadrada de Frutas.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Mezcla de frutas frescas y crema chantilly sobre un suave bizcocho de vainilla. Ideal para celebraciones."
  },
  {
    id: "TT001",
    nombre: "Torta Circular de Vainilla",
    precio: 40000,
    categoria: "Tortas Circulares",
    attr: "12 porciones",
    img: "/img/Torta Circular de Vainilla.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Bizcocho de vainilla clásico relleno con crema pastelera y glaseado dulce, perfecto para cualquier ocasión."
  },
  {
    id: "TT002",
    nombre: "Torta Circular de Manjar",
    precio: 42000,
    categoria: "Tortas Circulares",
    attr: "Con nueces",
    img: "/img/Torta Circular de Manjar.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Torta tradicional con manjar y nueces, un deleite para los amantes de los sabores clásicos."
  },
  {
    id: "PI001",
    nombre: "Mousse de Chocolate",
    precio: 5000,
    categoria: "Postres Individuales",
    attr: "Individual",
    img: "/img/Mousse de Chocolate.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Postre individual cremoso y suave, hecho con chocolate de alta calidad."
  },
  {
    id: "PI002",
    nombre: "Tiramisú Clásico",
    precio: 5500,
    categoria: "Postres Individuales",
    attr: "Individual",
    img: "/img/Tiramisú Clásico.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Postre italiano individual con capas de café, mascarpone y cacao. Perfecto para finalizar cualquier comida."
  },
  {
    id: "PSA001",
    nombre: "Torta Sin Azúcar de Naranja",
    precio: 48000,
    categoria: "Productos Sin Azúcar",
    attr: "Endulzada naturalmente",
    img: "/img/Torta Sin Azúcar de Naranja.png",
    stock: 6,
    stockCritico: 2,
    descripcion:
      "Ligera y deliciosa, endulzada naturalmente. Ideal para opciones más saludables."
  },
  {
    id: "PSA002",
    nombre: "Cheesecake Sin Azúcar",
    precio: 47000,
    categoria: "Productos Sin Azúcar",
    attr: "Sin azúcar",
    img: "/img/Cheesecake.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Suave y cremoso, opción perfecta para disfrutar sin culpa."
  },
  {
    id: "PG001",
    nombre: "Brownie Sin Gluten",
    precio: 4000,
    categoria: "Productos Sin Gluten",
    attr: "Cacao 70%",
    img: "/img/Brownie.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Rico y denso; ideal para quienes evitan el gluten sin sacrificar el sabor."
  },
  {
    id: "PG002",
    nombre: "Pan Sin Gluten",
    precio: 3500,
    categoria: "Productos Sin Gluten",
    attr: "Pan de molde",
    img: "/img/Pan integral.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Suave y esponjoso, perfecto para sándwiches o acompañar cualquier comida."
  },
  {
    id: "PV001",
    nombre: "Torta Vegana de Chocolate",
    precio: 50000,
    categoria: "Productos Vegana",
    attr: "Vegano",
    img: "/img/Torta Vegana de Chocolate.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Torta húmeda y deliciosa, sin productos de origen animal."
  },
  {
    id: "PV002",
    nombre: "Galletas Veganas de Avena",
    precio: 4500,
    categoria: "Productos Vegana",
    attr: "Pack x 10",
    img: "/img/Galletas Veganas de Avena.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Crujientes y sabrosas; excelente opción de snack."
  },
  {
    id: "TE001",
    nombre: "Torta Especial de Cumpleaños",
    precio: 55000,
    categoria: "Tortas Especiales",
    attr: "Personalizable",
    img: "/img/Torta Especial de Cumpleaños.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Personalizable con decoraciones y mensajes únicos."
  },
  {
    id: "BDAY001",
    nombre: "Torta Individual de Cumpleaños DUOC",
    precio: 25000,
    categoria: "Beneficios DUOC",
    attr: "Porción individual",
    img: "/img/torta_individual_cumpleaños.png",
    stock: 12,
    stockCritico: 3,
    descripcion:
      "Pastel individual con vela y decoración festiva, reservado como beneficio de cumpleaños para estudiantes y colaboradores DUOC."
  },
  {
    id: "TE002",
    nombre: "Torta Especial de Boda",
    precio: 60000,
    categoria: "Tortas Especiales",
    attr: "Diseño elegante",
    img: "/img/Torta Especial de Boda.png",
    stock: 6,
    stockCritico: 2,
    descripcion: "Elegante y deliciosa; pensada para ser el centro de tu boda."
  }
];

export const BASE_CATEGORIES = Array.from(
  new Set(BASE_PRODUCTS.map((p) => p.categoria))
);
