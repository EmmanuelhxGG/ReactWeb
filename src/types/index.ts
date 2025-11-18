export type Product = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  attr: string;
  img: string;
  stock: number;
  stockCritico: number;
  descripcion?: string;
};

export type CartItem = {
  id: string;
  qty: number;
  msg?: string;
};

export type ProductPricing = {
  originalUnitPrice: number;
  unitPrice: number;
  discountPercent: number;
  discountPerUnit: number;
  originalTotal: number;
  discountTotal: number;
  total: number;
};

export type UserAddress = {
  id: string;
  alias?: string;
  direccion: string;
  region: string;
  comuna: string;
  referencia?: string;
  createdAt: number;
  updatedAt: number;
};

export type UserPreferences = {
  defaultShip?: number;
  newsletter?: boolean;
  saveAddress?: boolean;
  addresses?: UserAddress[];
  primaryAddressId?: string;
};

export type CustomerUser = {
  run: string;
  tipo: string;
  nombre: string;
  apellidos: string;
  email: string;
  fnac: string;
  region: string;
  comuna: string;
  direccion: string;
  phone?: string;
  pass: string;
  promoCode?: string;
  felices50?: boolean;
  createdAt: number;
  bdayRedeemedYear?: number | null;
  prefs?: UserPreferences;
};

export type AdminUser = {
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  fnac?: string;
};

export type CustomerSession = {
  email: string;
  nombre?: string;
  fnac?: string;
  promoCode?: string;
  felices50?: boolean;
  bdayRedeemedYear?: number | null;
  prefs?: UserPreferences;
};

export type AdminSession = {
  correo: string;
  nombre?: string;
  rol: string;
};

export type CouponInfo = {
  code: string;
  type: "ship" | "amount";
  value: number;
  label: string;
};

export type CartTotals = {
  items: Array<{
    product: Product;
    qty: number;
    msg?: string;
    subtotal: number;
    pricing: ProductPricing;
  }>;
  subTotal: number;
  effectiveSubtotal: number;
  discountTotal: number;
  totalQty: number;
};

export type UserBenefits = {
  userDisc: number;
  userLabel: string;
  bdayDisc: number;
  bdayLabel: string;
  bdayEligible: boolean;
  bdayApplied: boolean;
  freeShipping: boolean;
  shippingLabel: string;
};

export type BlogComment = {
  id: string;
  ownerId: string;
  authorEmail: string;
  authorName: string;
  text: string;
  ts: number;
  editedAt: number | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  hero: {
    image: string;
    caption: string;
  };
  excerpt: string;
  body: Array<{ type: "p" | "heading" | "list"; content: string | string[] }>;
};

export type OrderItem = {
  codigo: string;
  nombre: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  cliente: string;
  total: number;
  estado: string;
  items: OrderItem[];
};
