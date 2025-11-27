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
<<<<<<< HEAD
=======
  primary?: boolean;
>>>>>>> master
};

export type UserPreferences = {
  defaultShip?: number;
  newsletter?: boolean;
  saveAddress?: boolean;
  addresses?: UserAddress[];
  primaryAddressId?: string;
};

export type AccountStatus = "active" | "inactive";

export type CustomerUser = {
<<<<<<< HEAD
  run: string;
  tipo: string;
=======
  id?: string;
  run: string;
  tipo?: string;
>>>>>>> master
  nombre: string;
  apellidos: string;
  email: string;
  fnac: string;
  region: string;
  comuna: string;
  direccion: string;
  phone?: string;
<<<<<<< HEAD
  pass: string;
=======
  pass?: string;
>>>>>>> master
  promoCode?: string;
  felices50?: boolean;
  createdAt: number;
  bdayRedeemedYear?: number | null;
  prefs?: UserPreferences;
  status?: AccountStatus;
};

export type AdminUser = {
<<<<<<< HEAD
=======
  id?: string;
>>>>>>> master
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  fnac?: string;
<<<<<<< HEAD
};

export type CustomerSession = {
=======
  phone?: string;
  status?: AccountStatus;
};

export type CustomerSession = {
  id?: string;
>>>>>>> master
  email: string;
  nombre?: string;
  fnac?: string;
  promoCode?: string;
  felices50?: boolean;
  bdayRedeemedYear?: number | null;
  prefs?: UserPreferences;
  status?: AccountStatus;
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

export type Order = {
  id: string;
<<<<<<< HEAD
  cliente: string;
  total: number;
  estado: string;
=======
  orderCode?: string;
  cliente: string;
  total: number;
  estado: string;
  statusRaw?: string;
>>>>>>> master
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  createdAt: number;
  customerEmail?: string;
  benefitsApplied?: string[];
  couponCode?: string;
  couponLabel?: string;
};

export type OrderItem = {
  codigo: string;
  nombre: string;
  qty: number;
  unitPrice: number;
  originalUnitPrice: number;
  discountPerUnit: number;
  subtotal: number;
  originalSubtotal: number;
  benefitLabels?: string[];
};
