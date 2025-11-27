<<<<<<< HEAD
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
=======
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
>>>>>>> master
import type {
  AccountStatus,
  AdminSession,
  AdminUser,
  BlogComment,
  CartItem,
  CartTotals,
<<<<<<< HEAD
=======
  CouponInfo,
>>>>>>> master
  CustomerSession,
  CustomerUser,
  Order,
  OrderItem,
  Product,
  ProductPricing,
  UserBenefits,
  UserAddress,
  UserPreferences
} from "../types";
<<<<<<< HEAD
import { BASE_PRODUCTS } from "../data/products";
import { COUPONS } from "../data/coupons";
import { BASE_ADMIN_USERS } from "../data/adminUsers";
import { BASE_ORDERS } from "../data/orders";
import { computeAge, isBirthdayToday } from "../utils/dates";
import { readJSON, removeKey, writeJSON } from "../utils/storage";
import { cleanRun, isRunValid, isEmailAllowed } from "../utils/validators";
import { buildReceiptHTML } from "../utils/receipt";

const USERS_KEY = "USERS_V1";
const CURRENT_USER_KEY = "CURRENT_USER_V1";
const CART_KEY = "cart"; // legacy guest cart
const SHIP_KEY = "shipCost";
const COUPON_KEY = "couponCode_v1";
const ADMIN_PRODUCTS_KEY = "ADMIN_PRODUCTS_V1";
const ADMIN_USERS_KEY = "ADMIN_USERS_V1";
const ADMIN_SESSION_KEY = "session";
const BLOG_COMMENTS_KEY = "BLOG_COMMENTS_V1";
const ORDERS_KEY = "ORDERS_V1";

const EMAIL_DUOC_REGEX = /@duoc\.cl$/i;
=======
import { computeAge, isBirthdayToday } from "../utils/dates";
import { buildReceiptHTML } from "../utils/receipt";
import {
  fetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct
} from "../services/products";
import { fetchCoupons } from "../services/coupons";
import { login, refreshAuth } from "../services/auth";
import {
  registerCustomer as apiRegisterCustomer,
  fetchCurrentCustomer,
  updateCurrentCustomer,
  fetchAdminCustomers,
  updateCustomerByAdmin,
  updateCustomerStatus,
  type CustomerProfileDto,
  type CustomerSummaryDto,
  type CustomerRegistrationRequestDto,
  type CustomerUpdateRequestDto,
  type CustomerAddressDto
} from "../services/customers";
import {
  createOrder as apiCreateOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus as apiUpdateOrderStatus,
  type CreateOrderRequestDto,
  type OrderResponseDto,
  type OrderStatusDto,
  type OrderItemResponseDto
} from "../services/orders";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  type StaffResponseDto,
  type StaffRequestDto,
  type StaffUpdateRequestDto
} from "../services/staff";
import {
  createBlogComment as apiCreateBlogComment,
  updateBlogComment as apiUpdateBlogComment,
  deleteBlogComment as apiDeleteBlogComment
} from "../services/blog";

const AUTH_STORAGE_KEY = "pagpasteleria::auth_v1";
>>>>>>> master
const FELICES_CODE = "FELICES50";
const BDAY_CAKE_ID = "BDAY001";
const SENIOR_DISCOUNT = 0.5;
const PROMO_DISCOUNT = 0.1;
const DEFAULT_SHIPPING_COST = 3000;
<<<<<<< HEAD
const ADDRESS_LIMIT = 5;
const SHIPPING_VALUES = [3000, 6000];

const generateAddressId = () => `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const sanitizeIncomingAddresses = (
  incoming: Array<Partial<UserAddress>>,
  existing: UserAddress[] | undefined,
  now: number
): UserAddress[] => {
  const map = new Map<string, UserAddress>();
  incoming.forEach((entry) => {
    if (!entry) return;
    const direccion = entry.direccion?.trim();
    const region = entry.region?.trim();
    const comuna = entry.comuna?.trim();
    if (!direccion || !region || !comuna) return;
    const trimmedId = typeof entry.id === "string" ? entry.id.trim() : "";
    const id = trimmedId || generateAddressId();
    const previous = existing?.find((addr) => addr.id === trimmedId);
    map.set(id, {
      id,
      alias: entry.alias?.trim() || undefined,
      direccion,
      region,
      comuna,
      referencia: entry.referencia?.trim() || undefined,
      createdAt: previous?.createdAt ?? entry.createdAt ?? now,
      updatedAt: now
    });
  });
  return Array.from(map.values()).slice(0, ADDRESS_LIMIT);
};

const normalizeShipCost = (value?: number) =>
  typeof value === "number" && SHIPPING_VALUES.includes(value) ? value : DEFAULT_SHIPPING_COST;

function normalizeProduct(entry: any): Product | null {
  if (!entry) return null;
  const id = String(
    entry.id || entry.codigo || entry.code || entry.nombre || entry.name || ""
  ).trim();
  if (!id) return null;
  const baseImg = entry.img || entry.imagen || entry.image || entry.picture || "";
  const isDataUrl = typeof baseImg === "string" && (baseImg.startsWith("data:") || baseImg.startsWith("/data:"));
  const cleanedDataUrl = isDataUrl ? baseImg.replace(/^\//, "") : baseImg;
  const img = isDataUrl
    ? cleanedDataUrl
    : cleanedDataUrl.startsWith("/")
      ? cleanedDataUrl
      : cleanedDataUrl
        ? `/${cleanedDataUrl}`
        : "";
  return {
    id,
    nombre: entry.nombre || entry.name || entry.title || "",
    precio: Number(entry.precio ?? entry.price ?? 0),
    categoria: entry.categoria || entry.category || entry.categoryName || "",
    attr: entry.attr || entry.atributo || entry.attributes || "",
    img,
    stock: Number(entry.stock ?? 0),
    stockCritico: Number(entry.stockCritico ?? 0),
    descripcion: entry.descripcion || entry.longDesc || ""
  };
}

function toAdminRecord(product: Product) {
  const image = product.img.startsWith("/data:")
    ? product.img.slice(1)
    : product.img.startsWith("/")
      ? product.img.slice(1)
      : product.img;
  return {
    codigo: product.id,
    nombre: product.nombre,
    precio: product.id === BDAY_CAKE_ID ? 0 : product.precio,
    categoria: product.categoria,
    attr: product.attr,
    imagen: image,
    stock: product.stock,
    stockCritico: product.stockCritico,
    descripcion: product.descripcion ?? ""
  };
}

function loadProducts(): Product[] {
  const storedRaw = readJSON<any[]>(ADMIN_PRODUCTS_KEY, []);
  if (!storedRaw.length) {
    writeJSON(ADMIN_PRODUCTS_KEY, BASE_PRODUCTS.map(toAdminRecord));
    return BASE_PRODUCTS.map((product) =>
      product.id === BDAY_CAKE_ID ? { ...product, precio: 0 } : product
    );
  }
  const baseMap = new Map(BASE_PRODUCTS.map((p) => [p.id, { ...p }]));
  storedRaw
    .map(normalizeProduct)
    .filter((p): p is Product => Boolean(p))
    .forEach((p) => {
      const existing = baseMap.get(p.id) || {};
      const merged = { ...existing, ...p };
      baseMap.set(p.id, merged.id === BDAY_CAKE_ID ? { ...merged, precio: 0 } : merged);
    });
  return Array.from(baseMap.values());
}

function normalizeStatus(status?: AccountStatus): AccountStatus {
  return status === "inactive" ? "inactive" : "active";
}

function loadCustomers(): CustomerUser[] {
  const stored = readJSON<CustomerUser[] | null>(USERS_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.map((user) => ({
    ...user,
    status: normalizeStatus(user?.status)
  }));
}

function loadCustomerSession(): CustomerSession | null {
  return readJSON<CustomerSession | null>(CURRENT_USER_KEY, null);
}

function loadAdminUsers(): AdminUser[] {
  const stored = readJSON<AdminUser[]>(ADMIN_USERS_KEY, []);
  if (!stored.length) {
    writeJSON(ADMIN_USERS_KEY, BASE_ADMIN_USERS);
    return BASE_ADMIN_USERS;
  }
  const map = new Map(
    BASE_ADMIN_USERS.map((u) => [u.run.toUpperCase(), { ...u }])
  );
  stored.forEach((user) => {
    map.set((user.run || "").toUpperCase(), { ...map.get(user.run.toUpperCase()), ...user });
  });
  return Array.from(map.values());
}

function loadAdminSession(): AdminSession | null {
  return readJSON<AdminSession | null>(ADMIN_SESSION_KEY, null);
}

const normalizeBenefitList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const filtered = value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
  return filtered.length ? filtered : undefined;
};

const normalizeOrderItem = (entry: any): OrderItem => {
  const qtyRaw = Number(entry?.qty ?? 0);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? Math.floor(qtyRaw) : 1;
  const originalUnit = Number(entry?.originalUnitPrice ?? entry?.price ?? entry?.unitPrice ?? 0);
  const unit = Number(entry?.unitPrice ?? entry?.price ?? originalUnit);
  const discountPerUnit = Number(entry?.discountPerUnit ?? Math.max(0, originalUnit - unit));
  const originalSubtotal = Number(entry?.originalSubtotal ?? originalUnit * qty);
  const subtotal = Number(entry?.subtotal ?? unit * qty);
  const benefitLabels = normalizeBenefitList(entry?.benefitLabels);
  return {
    codigo: String(entry?.codigo || entry?.id || "").trim() || "SIN-COD",
    nombre: String(entry?.nombre || entry?.name || "Producto").trim() || "Producto",
    qty,
    unitPrice: Math.max(0, unit),
    originalUnitPrice: Math.max(0, originalUnit),
    discountPerUnit: Math.max(0, discountPerUnit),
    subtotal: Math.max(0, subtotal),
    originalSubtotal: Math.max(0, originalSubtotal),
    benefitLabels
  } satisfies OrderItem;
};

function normalizeOrder(entry: any): Order {
  const items: OrderItem[] = Array.isArray(entry?.items) ? entry.items.map(normalizeOrderItem) : [];
  const subtotal = Number(entry?.subtotal ?? items.reduce((sum: number, item: OrderItem) => sum + item.originalSubtotal, 0));
  const shippingCost = Number(entry?.shippingCost ?? 0);
  const total = Number(entry?.total ?? Math.max(0, subtotal - (entry?.discountTotal ?? 0) + shippingCost));
  const discountFromItems = items.reduce(
    (sum: number, item: OrderItem) => sum + Math.max(0, item.originalSubtotal - item.subtotal),
    0
  );
  const discountTotal = Number(entry?.discountTotal ?? discountFromItems);
  const createdAtRaw = Number(entry?.createdAt ?? entry?.fecha ?? entry?.date ?? Date.now());
  const createdAt = Number.isFinite(createdAtRaw) && createdAtRaw > 0 ? createdAtRaw : Date.now();
  const customerEmailValue =
    typeof entry?.customerEmail === "string" && entry.customerEmail.trim()
      ? entry.customerEmail.trim()
      : typeof entry?.contactEmail === "string" && entry.contactEmail.trim()
        ? entry.contactEmail.trim()
        : typeof entry?.email === "string" && entry.email.trim()
          ? entry.email.trim()
          : undefined;
  const couponLabelValue = typeof entry?.couponLabel === "string" && entry.couponLabel.trim() ? entry.couponLabel.trim() : undefined;
  return {
    id: String(entry?.id || `PED${Date.now()}`).trim(),
    cliente: String(entry?.cliente || "Cliente").trim(),
    total: Math.max(0, total),
    estado: typeof entry?.estado === "string" && entry.estado.trim() ? entry.estado : "Pendiente",
    items,
    subtotal: Math.max(0, subtotal),
    discountTotal: Math.max(0, discountTotal),
    shippingCost: Math.max(0, shippingCost),
    createdAt,
    customerEmail: customerEmailValue,
    benefitsApplied: normalizeBenefitList(entry?.benefitsApplied),
    couponCode: typeof entry?.couponCode === "string" && entry.couponCode.trim() ? entry.couponCode.trim() : undefined,
    couponLabel: couponLabelValue
  } satisfies Order;
}

function loadOrders(): Order[] {
  const stored = readJSON<any[]>(ORDERS_KEY, []);
  if (!stored.length) {
    writeJSON(ORDERS_KEY, BASE_ORDERS);
    return BASE_ORDERS;
  }
  return stored.map(normalizeOrder);
}

function loadComments(): Record<string, BlogComment[]> {
  const raw = readJSON<Record<string, any[]>>(BLOG_COMMENTS_KEY, {});
  const ensure = (list?: any[]) =>
    Array.isArray(list)
      ? list.map((c) => {
          const comment = c as any;
          const owner = (comment.ownerId || comment.authorEmail || comment.email || "").toLowerCase();
          return {
            id:
              comment.id || `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            ownerId: owner,
            authorEmail: owner,
            authorName: comment.authorName || comment.name || comment.author || "",
            text: comment.text || "",
            ts: Number(comment.ts || Date.now()),
            editedAt: comment.editedAt ?? null
          } satisfies BlogComment;
        })
      : [];
  const result: Record<string, BlogComment[]> = {};
  for (const key of Object.keys(raw)) {
    result[key] = ensure(raw[key]);
  }
  writeJSON(BLOG_COMMENTS_KEY, result);
  return result;
}
=======
const SHIPPING_VALUES = [3000, 6000];
const EMAIL_DUOC_REGEX = /@duoc\.cl$/i;
>>>>>>> master

type CouponEval = {
  valid: boolean;
  discount: number;
  shipAfter: number;
  label?: string;
  code?: string;
};

type NotificationKind = "info" | "success" | "error";
type NotificationMode = "toast" | "dialog";

type DialogInputConfig = {
  label?: string;
  type?: "text" | "number" | "email";
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  autoFocus?: boolean;
};

type NotificationPayload = {
  message: string;
  kind?: NotificationKind;
  mode?: NotificationMode;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: (value?: string) => void;
  onCancel?: () => void;
  durationMs?: number;
  input?: DialogInputConfig;
};

type AppNotification = {
  id: string;
  message: string;
  kind: NotificationKind;
  mode: NotificationMode;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: (value?: string) => void;
  onCancel?: () => void;
  durationMs?: number;
  input?: DialogInputConfig;
};

<<<<<<< HEAD
export type { AppNotification, NotificationPayload, DialogInputConfig };
=======
type AuthRole = "CUSTOMER" | "ADMIN";

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  role: AuthRole | null;
  userId: string | null;
  expiresAt: number | null;
  refreshExpiresAt: number | null;
};

const EMPTY_AUTH: AuthState = {
  token: null,
  refreshToken: null,
  role: null,
  userId: null,
  expiresAt: null,
  refreshExpiresAt: null
};

const ORDER_STATUS_LABEL: Record<OrderStatusDto, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "Preparando",
  ENVIADO: "Despachado",
  CANCELADO: "Cancelado",
  COMPLETADO: "Entregado"
};

const ORDER_LABEL_TO_STATUS: Record<string, OrderStatusDto> = {
  Pendiente: "PENDIENTE",
  Preparando: "EN_PROCESO",
  Despachado: "ENVIADO",
  Entregado: "COMPLETADO",
  Cancelado: "CANCELADO"
};

const SHIPPING_OPTION_LOOKUP = new Set(SHIPPING_VALUES);

const normalizeShipCost = (value?: number) =>
  typeof value === "number" && SHIPPING_OPTION_LOOKUP.has(value) ? value : DEFAULT_SHIPPING_COST;

const normalizeAccountStatus = (status?: string | null): AccountStatus =>
  status && status.toLowerCase() === "inactive" ? "inactive" : "active";

const toEpochMillis = (value?: string | number | null): number => {
  if (typeof value === "number") return value;
  if (!value) return Date.now();
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : Date.now();
};

const mapAddressDto = (dto: CustomerAddressDto): UserAddress => ({
  id: dto.id,
  alias: dto.alias ?? undefined,
  direccion: dto.direccion,
  region: dto.region,
  comuna: dto.comuna,
  referencia: dto.referencia ?? undefined,
  createdAt: dto.createdAt ?? Date.now(),
  updatedAt: dto.updatedAt ?? Date.now(),
  primary: dto.primary
});

const mapCustomerProfile = (dto: CustomerProfileDto): CustomerUser => {
  const addresses = dto.addresses?.map(mapAddressDto) ?? [];
  const primaryAddress = addresses.find((item) => item.primary) ?? addresses[0];
  const prefs: UserPreferences | undefined = addresses.length
    ? {
        addresses,
        primaryAddressId: primaryAddress?.id,
        defaultShip: dto.defaultShippingCost ?? DEFAULT_SHIPPING_COST,
        newsletter: dto.newsletter,
        saveAddress: dto.saveAddress
      }
    : dto.defaultShippingCost || dto.newsletter || dto.saveAddress
      ? {
          defaultShip: dto.defaultShippingCost ?? DEFAULT_SHIPPING_COST,
          newsletter: dto.newsletter,
          saveAddress: dto.saveAddress
        }
      : undefined;

  const birthIso = dto.birthDate ?? "";

  return {
    id: dto.id,
    run: dto.run,
    tipo: dto.customerType ?? "Cliente",
    nombre: dto.firstName ?? "",
    apellidos: dto.lastName ?? "",
    email: dto.email,
    fnac: birthIso,
    region: dto.region ?? "",
    comuna: dto.commune ?? "",
    direccion: dto.address ?? "",
    phone: dto.phone ?? undefined,
    promoCode: dto.promoCode ?? undefined,
    felices50: dto.felices50,
    createdAt: toEpochMillis(dto.createdAt),
    bdayRedeemedYear: dto.birthdayRedeemedYear ?? undefined,
    prefs,
    status: normalizeAccountStatus(dto.status)
  };
};

const mapCustomerSummary = (dto: CustomerSummaryDto): CustomerUser => ({
  id: dto.id,
  run: dto.run,
  tipo: dto.customerType ?? "Cliente",
  nombre: dto.firstName ?? "",
  apellidos: dto.lastName ?? "",
  email: dto.email,
  fnac: dto.birthDate ?? "",
  region: dto.region ?? "",
  comuna: dto.commune ?? "",
  direccion: "",
  createdAt: Date.now(),
  promoCode: undefined,
  felices50: dto.felices50,
  bdayRedeemedYear: dto.birthdayRedeemedYear ?? undefined,
  prefs: {
    defaultShip: dto.defaultShippingCost ?? DEFAULT_SHIPPING_COST,
    newsletter: dto.newsletter,
    saveAddress: true
  },
  status: normalizeAccountStatus(dto.status)
});

const mapStaff = (dto: StaffResponseDto): AdminUser => ({
  id: dto.id,
  run: dto.run,
  nombre: dto.firstName ?? "",
  apellidos: dto.lastName ?? "",
  correo: dto.email,
  rol: dto.staffRole ?? "Administrador",
  region: dto.region ?? undefined,
  comuna: dto.commune ?? undefined,
  direccion: dto.address ?? undefined,
  phone: dto.phone ?? undefined,
  status: normalizeAccountStatus(dto.status)
});

const mapOrderItem = (dto: OrderItemResponseDto): OrderItem => ({
  codigo: dto.codigo,
  nombre: dto.nombre,
  qty: dto.quantity,
  unitPrice: dto.unitPrice,
  originalUnitPrice: dto.originalUnitPrice,
  discountPerUnit: dto.discountPerUnit,
  subtotal: dto.subtotal,
  originalSubtotal: dto.originalSubtotal,
  benefitLabels: dto.benefitLabels ?? undefined
});

const mapOrder = (dto: OrderResponseDto): Order => ({
  id: dto.orderCode || dto.id,
  orderCode: dto.orderCode,
  cliente: dto.customerName,
  total: dto.total,
  estado: ORDER_STATUS_LABEL[dto.status] ?? dto.status,
  statusRaw: dto.status,
  items: dto.items.map(mapOrderItem),
  subtotal: dto.subtotal,
  discountTotal: dto.discountTotal,
  shippingCost: dto.shippingCost,
  createdAt: dto.createdAt,
  customerEmail: dto.customerEmail ?? undefined,
  benefitsApplied: dto.benefitsApplied ?? undefined,
  couponCode: dto.couponCode ?? undefined,
  couponLabel: dto.couponLabel ?? undefined
});

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const payload = (error as Record<string, unknown>).payload;
    if (payload && typeof payload === "object") {
      const message = (payload as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) return message;
      const errors = (payload as Record<string, unknown>).errors;
      if (Array.isArray(errors) && errors.length) {
        return errors.join(", ");
      }
    }
    const errMsg = (error as Record<string, unknown>).message;
    if (typeof errMsg === "string" && errMsg.trim()) return errMsg;
  }
  return fallback;
};
>>>>>>> master

type ContextValue = {
  products: Product[];
  storefrontProducts: Product[];
<<<<<<< HEAD
  refreshProducts: () => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
=======
  refreshProducts: () => Promise<void>;
  upsertProduct: (product: Product, options?: { isNew?: boolean }) => Promise<{ ok: boolean; message?: string }>;
  removeProduct: (id: string) => Promise<{ ok: boolean; message?: string }>;
>>>>>>> master
  cart: CartItem[];
  addToCart: (id: string, qty?: number, msg?: string) => void;
  setCartQty: (id: string, qty: number, msg?: string) => void;
  removeFromCart: (id: string, msg?: string) => void;
  clearCart: () => void;
  cartTotals: CartTotals;
  shippingCost: number;
  setShippingCost: (value: number) => void;
  coupon: string;
  setCoupon: (code: string) => void;
  evaluateCoupon: (subTotal: number, shipCost: number) => CouponEval;
  benefitsForCart: (items: CartTotals["items"], subTotal: number) => UserBenefits;
  userDiscountPercent: number;
  getProductPricing: (product: Product, qty?: number) => ProductPricing;
  notifications: AppNotification[];
  showNotification: (payload: NotificationPayload) => void;
  dismissNotification: (id: string) => void;
  customerSession: CustomerSession | null;
  customers: CustomerUser[];
  currentCustomer: CustomerUser | null;
  birthdayRewardEligible: boolean;
  birthdayRewardAvailable: boolean;
  registerCustomer: (
<<<<<<< HEAD
    payload: Omit<CustomerUser, "createdAt" | "bdayRedeemedYear"> & {
      createdAt?: number;
      bdayRedeemedYear?: number | null;
    }
  ) => { ok: boolean; message?: string };
  loginCustomer: (email: string, password: string) => { ok: boolean; message?: string };
  logoutCustomer: () => void;
  updateCustomer: (updates: Partial<CustomerUser>) => void;
  upsertCustomer: (user: CustomerUser) => void;
  removeCustomer: (email: string) => void;
  setCustomerStatus: (email: string, status: AccountStatus) => void;
  adminUsers: AdminUser[];
  upsertAdminUser: (user: AdminUser) => void;
  removeAdminUser: (run: string) => void;
  adminSession: AdminSession | null;
  adminLogin: (email: string, password: string) => { ok: boolean; message?: string };
  adminLogout: () => void;
  orders: Order[];
  updateOrders: (orders: Order[]) => void;
  comments: Record<string, BlogComment[]>;
  addComment: (postId: string, text: string) => { ok: boolean; message?: string };
  editComment: (postId: string, id: string, text: string) => void;
  deleteComment: (postId: string, id: string) => void;
  openReceiptWindow: (payload: {
    items: CartTotals["items"];
    subTotal: number;
    effectiveSubtotal: number;
    benefits: UserBenefits;
    coupon: CouponEval;
    shipCost: number;
    total: number;
    contactEmail?: string | null;
  }) => void;
};

const AppContext = createContext<ContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [customers, setCustomers] = useState<CustomerUser[]>(() => loadCustomers());
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(() => loadCustomerSession());
  // Make cart unique per customer (if logged) otherwise use guest key
  const cartStorageKey = customerSession?.email ? `${CART_KEY}_${customerSession.email.toLowerCase()}` : CART_KEY;
  const [cart, setCart] = useState<CartItem[]>(() => readJSON<CartItem[]>(cartStorageKey, []));
  const [shippingCost, setShippingCostState] = useState<number>(() => readJSON<number>(SHIP_KEY, 0));
  const [coupon, setCouponState] = useState<string>(() => readJSON<string>(COUPON_KEY, ""));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => loadAdminUsers());
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => loadAdminSession());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [comments, setComments] = useState<Record<string, BlogComment[]>>(() => loadComments());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationTimers = useRef<Record<string, number>>({});

  const currentCustomer = useMemo(() => {
    if (!customerSession) return null;
    const email = customerSession.email.toLowerCase();
    return customers.find((user) => user.email.toLowerCase() === email) || null;
  }, [customerSession, customers]);
=======
    payload: Omit<CustomerUser, "createdAt" | "bdayRedeemedYear" | "id" | "status" | "prefs"> & {
      prefs?: UserPreferences;
      createdAt?: number;
      bdayRedeemedYear?: number | null;
    }
  ) => Promise<{ ok: boolean; message?: string }>;
  loginCustomer: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logoutCustomer: () => Promise<void>;
  updateCustomer: (updates: Partial<CustomerUser>) => Promise<{ ok: boolean; message?: string }>;
  upsertCustomer: (user: CustomerUser) => Promise<{ ok: boolean; message?: string }>;
  removeCustomer: (email: string) => void;
  setCustomerStatus: (email: string, status: AccountStatus) => Promise<{ ok: boolean; message?: string }>;
  adminUsers: AdminUser[];
  upsertAdminUser: (user: AdminUser & { password?: string }) => Promise<{ ok: boolean; message?: string }>;
  removeAdminUser: (run: string) => Promise<{ ok: boolean; message?: string }>;
  adminSession: AdminSession | null;
  adminLogin: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  adminLogout: () => Promise<void>;
  orders: Order[];
  refreshOrders: () => Promise<void>;
  changeOrderStatus: (orderId: string, nextStatusLabel: string) => Promise<{ ok: boolean; message?: string }>;
  comments: Record<string, BlogComment[]>;
  addComment: (postSlug: string, text: string) => Promise<{ ok: boolean; message?: string }>;
  hydrateComments: (postSlug: string, list: BlogComment[]) => void;
  editComment: (postSlug: string, id: string, text: string) => Promise<{ ok: boolean; message?: string }>;
  deleteComment: (postSlug: string, id: string) => Promise<{ ok: boolean; message?: string }>;
  openReceiptWindow: (order: Order) => void;
  placeOrder: (request: CreateOrderRequestDto) => Promise<{ ok: boolean; order?: Order; message?: string }>;
};

export type { AppNotification, NotificationPayload, DialogInputConfig };

const AppContext = createContext<ContextValue | undefined>(undefined);

function loadAuthFromSession(): AuthState {
  if (typeof window === "undefined") return EMPTY_AUTH;
  const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return EMPTY_AUTH;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (parsed && typeof parsed === "object" && typeof parsed.token === "string" && parsed.token) {
      return {
        token: parsed.token,
        refreshToken: typeof parsed.refreshToken === "string" && parsed.refreshToken ? parsed.refreshToken : null,
        role: (parsed.role as AuthRole) ?? null,
        userId: parsed.userId ?? null,
        expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : null,
        refreshExpiresAt: typeof parsed.refreshExpiresAt === "number" ? parsed.refreshExpiresAt : null
      };
    }
  } catch (error) {
    console.warn("No se pudo leer el estado de autenticación almacenado", error);
  }
  return EMPTY_AUTH;
}

const saveAuthToSession = (state: AuthState) => {
  if (typeof window === "undefined") return;
  if (!state.token) {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      refreshToken: state.refreshToken,
      role: state.role,
      userId: state.userId,
      expiresAt: state.expiresAt,
      refreshExpiresAt: state.refreshExpiresAt
    })
  );
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => loadAuthFromSession());
  const [products, setProducts] = useState<Product[]>([]);
  const [couponDefinitions, setCouponDefinitions] = useState<Record<string, CouponInfo>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingCost, setShippingCostState] = useState<number>(DEFAULT_SHIPPING_COST);
  const [coupon, setCouponState] = useState<string>("");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationTimers = useRef<Record<string, number>>({});
  const refreshTimerRef = useRef<number | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerUser | null>(null);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Record<string, BlogComment[]>>({});
  const [initialHydrated, setInitialHydrated] = useState(false);

  const customerSession = useMemo<CustomerSession | null>(() => {
    if (!customerProfile) return null;
    return {
      id: customerProfile.id,
      email: customerProfile.email,
      nombre: customerProfile.nombre,
      fnac: customerProfile.fnac,
      promoCode: customerProfile.promoCode,
      felices50: customerProfile.felices50,
      bdayRedeemedYear: customerProfile.bdayRedeemedYear ?? undefined,
      prefs: customerProfile.prefs,
      status: customerProfile.status
    };
  }, [customerProfile]);

  const currentCustomer = customerProfile;
>>>>>>> master

  const birthdayRewardEligible = useMemo(() => {
    if (!customerSession) return false;
    if (!EMAIL_DUOC_REGEX.test(customerSession.email || "")) return false;
    return isBirthdayToday(customerSession.fnac);
  }, [customerSession]);

  const birthdayRewardAvailable = useMemo(() => {
    if (!birthdayRewardEligible) return false;
    const thisYear = new Date().getFullYear();
    return (customerSession?.bdayRedeemedYear ?? null) !== thisYear;
  }, [birthdayRewardEligible, customerSession]);

  const storefrontProducts = useMemo(() => {
    if (birthdayRewardEligible) return products;
    return products.filter((product) => product.id !== BDAY_CAKE_ID);
  }, [products, birthdayRewardEligible]);

  const userDiscountPercent = useMemo(() => {
<<<<<<< HEAD
    if (!customerSession) return 0;
    const age = computeAge(customerSession.fnac ?? "");
    if (typeof age === "number" && age > 50) return SENIOR_DISCOUNT;
    if (customerSession.promoCode === FELICES_CODE || customerSession.felices50) {
      return PROMO_DISCOUNT;
    }
    return 0;
  }, [customerSession]);
=======
    if (!customerProfile) return 0;
    const age = computeAge(customerProfile.fnac ?? "");
    if (typeof age === "number" && age > 50) return SENIOR_DISCOUNT;
    if (customerProfile.promoCode?.toUpperCase() === FELICES_CODE || customerProfile.felices50) {
      return PROMO_DISCOUNT;
    }
    return 0;
  }, [customerProfile]);
>>>>>>> master

  const getProductPricing = useCallback(
    (product: Product, qty = 1): ProductPricing => {
      const quantity = Number.isFinite(qty) ? Math.max(1, Math.floor(qty)) : 1;
      if (product.id === BDAY_CAKE_ID && birthdayRewardAvailable) {
        const originalUnitPrice = product.precio;
        const discountPerUnit = originalUnitPrice;
        const discountTotal = discountPerUnit * quantity;
        return {
          originalUnitPrice,
          unitPrice: 0,
          discountPercent: 1,
          discountPerUnit,
          originalTotal: originalUnitPrice * quantity,
          discountTotal,
          total: 0
        };
      }
      const originalUnitPrice = product.precio;
      const discountPercent = userDiscountPercent;
      const unitPrice = discountPercent > 0
        ? Math.max(0, Math.round(originalUnitPrice * (1 - discountPercent)))
        : originalUnitPrice;
      const discountPerUnit = Math.max(0, originalUnitPrice - unitPrice);
      const originalTotal = originalUnitPrice * quantity;
      const total = unitPrice * quantity;
      const discountTotal = discountPerUnit * quantity;
      return {
        originalUnitPrice,
        unitPrice,
        discountPercent,
        discountPerUnit,
        originalTotal,
        discountTotal,
        total
      };
    },
    [userDiscountPercent, birthdayRewardAvailable]
  );

<<<<<<< HEAD
  useEffect(() => {
    // Persist cart to a per-user key when possible
    writeJSON(cartStorageKey, cart);
  }, [cart, cartStorageKey]);

  useEffect(() => {
    // When the storage key changes (login/logout), load the matching cart
    setCart(readJSON<CartItem[]>(cartStorageKey, []));
  }, [cartStorageKey]);

  useEffect(() => {
    writeJSON(SHIP_KEY, shippingCost);
  }, [shippingCost]);

  useEffect(() => {
    writeJSON(COUPON_KEY, coupon.trim().toUpperCase());
  }, [coupon]);

  const preferredShipping = currentCustomer?.prefs?.defaultShip ?? customerSession?.prefs?.defaultShip;
  useEffect(() => {
    const normalized = normalizeShipCost(preferredShipping);
    setShippingCostState((prev) => (prev === normalized ? prev : normalized));
  }, [preferredShipping]);

  useEffect(() => {
    writeJSON(USERS_KEY, customers);
  }, [customers]);

  useEffect(() => {
    customerSession
      ? writeJSON(CURRENT_USER_KEY, customerSession)
      : removeKey(CURRENT_USER_KEY);
  }, [customerSession]);

  useEffect(() => {
    writeJSON(ADMIN_USERS_KEY, adminUsers);
  }, [adminUsers]);

  useEffect(() => {
    adminSession
      ? writeJSON(ADMIN_SESSION_KEY, adminSession)
      : removeKey(ADMIN_SESSION_KEY);
  }, [adminSession]);

  useEffect(() => {
    writeJSON(ORDERS_KEY, orders);
  }, [orders]);

  useEffect(() => {
    writeJSON(BLOG_COMMENTS_KEY, comments);
  }, [comments]);

  useEffect(() => () => {
    const timers = notificationTimers.current;
    for (const id of Object.keys(timers)) {
      window.clearTimeout(timers[id]);
    }
  }, []);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === ADMIN_PRODUCTS_KEY) {
        setProducts(loadProducts());
      }
      if (event.key === USERS_KEY) {
        setCustomers(loadCustomers());
      }
      if (event.key === CURRENT_USER_KEY) {
        setCustomerSession(loadCustomerSession());
      }
      if (event.key === ADMIN_USERS_KEY) {
        setAdminUsers(loadAdminUsers());
      }
      if (event.key === ADMIN_SESSION_KEY) {
        setAdminSession(loadAdminSession());
      }
      if (event.key === BLOG_COMMENTS_KEY) {
        setComments(loadComments());
      }
      if (event.key === ORDERS_KEY) {
        setOrders(loadOrders());
      }
      // React to cart changes for other tabs (guest or user-specific)
      if (event.key && event.key.startsWith(CART_KEY)) {
        // if it's the current user's cart key, reload
        const myKey = customerSession?.email ? `${CART_KEY}_${customerSession.email.toLowerCase()}` : CART_KEY;
        if (event.key === myKey) {
          setCart(readJSON<CartItem[]>(myKey, []));
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Prune cart items when products change (evita huérfanos)
  useEffect(() => {
    const ids = new Set(products.map((p) => p.id));
    setCart((prev) => {
      const filtered = prev.filter((item) => ids.has(item.id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [products]);

  const refreshProducts = useCallback(() => {
    setProducts(loadProducts());
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((entry) => entry.id !== id));
    const timer = notificationTimers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete notificationTimers.current[id];
    }
  }, []);

  const showNotification = useCallback(
    (payload: NotificationPayload) => {
      const id = `nt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const entry: AppNotification = {
        id,
        message: payload.message,
        kind: payload.kind ?? "info",
        mode: payload.mode ?? "toast",
        actionLabel: payload.actionLabel,
        cancelLabel: payload.cancelLabel,
        onAction: payload.onAction,
        onCancel: payload.onCancel,
        durationMs: payload.durationMs,
        input: payload.input
      };
      setNotifications((prev) => [...prev, entry]);
      if (entry.mode !== "dialog") {
        const timeout = window.setTimeout(() => {
          dismissNotification(id);
        }, entry.durationMs ?? 4000);
        notificationTimers.current[id] = timeout;
      }
    },
    [dismissNotification]
  );

  const upsertProduct = useCallback(
    (product: Product) => {
      setProducts((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        const nextProduct = product.id === BDAY_CAKE_ID ? { ...product, precio: 0 } : product;
        map.set(product.id, nextProduct);
        const next = Array.from(map.values()).map((entry) =>
          entry.id === BDAY_CAKE_ID ? { ...entry, precio: 0 } : entry
        );
        writeJSON(ADMIN_PRODUCTS_KEY, next.map(toAdminRecord));
        return next;
      });
    },
    []
  );

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeJSON(ADMIN_PRODUCTS_KEY, next.map(toAdminRecord));
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1, msg = "") => {
      const product = products.find((p) => p.id === id);
      if (!product) {
        showNotification({
          message: "Este producto ya no está disponible.",
          kind: "error"
        });
        return;
      }
      if (customerSession?.status === "inactive") {
        showNotification({
          message: "Tu cuenta está desactivada. Contáctanos para reactivarla.",
          kind: "error",
          mode: "dialog",
          actionLabel: "Entendido"
        });
        return;
      }
      if (product.stock <= 0) {
        showNotification({
          message: "Sin stock disponible.",
          kind: "error"
        });
        return;
      }
      const isBirthdayCake = product.id === BDAY_CAKE_ID;
      if (isBirthdayCake && !birthdayRewardAvailable) {
        showNotification({
          message: "Ya reclamaste esta torta por tu cumpleaños.",
          kind: "info",
          mode: "dialog"
        });
        return;
      }
      const desired = Math.max(1, Number(qty));
      let outcome: { addedQty: number; status: "none" | "added" | "partial" | "noStock" } = {
        addedQty: 0,
        status: "none"
      };
      setCart((prev) => {
        const idx = prev.findIndex((item) => item.id === id && (item.msg || "") === msg);
        const currentQty = idx >= 0 ? prev[idx].qty : 0;
        const limit = isBirthdayCake ? Math.min(1, product.stock) : product.stock;
        const remaining = Math.max(0, limit - currentQty);
        if (remaining <= 0) {
          outcome = { addedQty: 0, status: "noStock" };
          return prev;
        }
        const toAdd = Math.min(desired, remaining);
        if (toAdd <= 0) {
          outcome = { addedQty: 0, status: "noStock" };
          return prev;
        }
        outcome = {
          addedQty: toAdd,
          status: toAdd < desired ? "partial" : "added"
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + toAdd };
          return next;
        }
        return [...prev, { id, qty: toAdd, msg }];
      });
      if (outcome.status === "noStock") {
        showNotification({
          message: "Sin stock disponible.",
          kind: "error"
        });
        return;
      }
      if (outcome.addedQty > 0) {
        const message =
          outcome.status === "partial"
            ? `Solo pudimos agregar ${outcome.addedQty} unidad(es). Stock disponible: ${product.stock}.`
            : `${product.nombre} añadido al carrito.`;
        showNotification({
          message,
          kind: "success",
          mode: "dialog",
          actionLabel: "OK"
        });
      }
    },
    [products, showNotification, birthdayRewardAvailable, customerSession?.status]
  );

  const setCartQty = useCallback(
    (id: string, qty: number, msg = "") => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      if (customerSession?.status === "inactive") {
        showNotification({
          message: "Tu cuenta está desactivada. No puedes modificar el carrito.",
          kind: "error",
          mode: "dialog",
          actionLabel: "Entendido"
        });
        return;
      }
      const isBirthdayCake = product.id === BDAY_CAKE_ID;
      const desiredRaw = Math.floor(Number.isFinite(qty) ? qty : 0);
      const desired = product.stock > 0 ? Math.max(1, desiredRaw) : 0;
      const max = isBirthdayCake ? Math.min(1, product.stock) : product.stock;
      const nextQty = Math.min(desired, max);
      if (desired > max) {
        showNotification({
          message: `Stock disponible: ${max}`,
          kind: "info"
        });
      }
      setCart((prev) => {
        const idx = prev.findIndex((item) => item.id === id && (item.msg || "") === msg);
        if (idx === -1) return prev;
        const next = [...prev];
        if (nextQty === 0 || (isBirthdayCake && !birthdayRewardAvailable)) {
          next.splice(idx, 1);
        } else {
          next[idx] = { ...next[idx], qty: nextQty };
        }
        return next;
      });
    },
    [products, showNotification, birthdayRewardAvailable, customerSession?.status]
  );

  const removeFromCart = useCallback((id: string, msg = "") => {
    setCart((prev) => prev.filter((item) => !(item.id === id && (item.msg || "") === msg)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

=======
>>>>>>> master
  const cartTotals = useMemo<CartTotals>(() => {
    const items = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return null;
        const isBirthdayCake = product.id === BDAY_CAKE_ID;
        const available = Math.max(1, isBirthdayCake ? Math.min(1, product.stock) : product.stock);
        const qty = Math.min(available, Math.max(1, Math.floor(Number.isFinite(item.qty) ? item.qty : 1)));
        const pricing = getProductPricing(product, qty);
        return {
          product,
          qty,
          msg: item.msg,
          subtotal: pricing.originalTotal,
          pricing
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    const subTotal = items.reduce((sum, entry) => sum + entry.subtotal, 0);
    const effectiveSubtotal = items.reduce((sum, entry) => sum + entry.pricing.total, 0);
    const discountTotal = items.reduce((sum, entry) => sum + entry.pricing.discountTotal, 0);
    const totalQty = items.reduce((sum, entry) => sum + entry.qty, 0);
    return { items, subTotal, effectiveSubtotal, discountTotal, totalQty };
  }, [cart, products, getProductPricing]);

  const setShippingCost = useCallback((value: number) => {
    setShippingCostState(Math.max(0, Number(value) || 0));
  }, []);

  const setCoupon = useCallback((code: string) => {
    setCouponState(code.trim().toUpperCase());
  }, []);

  const evaluateCoupon = useCallback(
    (subTotal: number, shipCost: number): CouponEval => {
      const code = coupon.trim().toUpperCase();
      if (!code || code === FELICES_CODE) {
        return { valid: false, discount: 0, shipAfter: shipCost };
      }
<<<<<<< HEAD
      const definition = COUPONS[code];
=======
      const definition = couponDefinitions[code];
>>>>>>> master
      if (!definition) {
        return { valid: false, discount: 0, shipAfter: shipCost };
      }
      if (definition.type === "amount") {
        const discount = Math.max(0, Math.min(subTotal, definition.value));
        return { valid: true, discount, shipAfter: shipCost, label: definition.label, code };
      }
      if (definition.type === "ship") {
        return { valid: true, discount: 0, shipAfter: 0, label: definition.label, code };
      }
      return { valid: false, discount: 0, shipAfter: shipCost };
    },
<<<<<<< HEAD
    [coupon]
=======
    [coupon, couponDefinitions]
>>>>>>> master
  );

  const benefitsForCart = useCallback(
    (items: CartTotals["items"], subTotal: number): UserBenefits => {
      if (!customerSession) {
        return {
          userDisc: 0,
          userLabel: "",
          bdayDisc: 0,
          bdayLabel: "",
          bdayEligible: false,
          bdayApplied: false,
          freeShipping: false,
          shippingLabel: ""
        };
      }

      const eligibleToday = birthdayRewardEligible;
      const rewardAvailable = birthdayRewardAvailable;

      const cake = items.find((item) => item.product.id === BDAY_CAKE_ID);

      let bdayDisc = 0;
      let bdayLabel = "";
      let bdayApplied = false;
      let freeShipping = false;
      let shippingLabel = "";
      if (rewardAvailable && cake && cake.qty > 0) {
        const cakeDiscount = cake.pricing?.discountTotal ?? cake.product.precio * cake.qty;
        bdayDisc = cakeDiscount;
        bdayLabel = "Beneficio DUOC: Torta de Cumpleaños gratis";
        bdayApplied = cakeDiscount > 0;
        const onlyCakeInCart = items.length === 1 && cake.product.id === BDAY_CAKE_ID;
        if (onlyCakeInCart) {
          freeShipping = true;
          shippingLabel = "Envío gratis por tu cumpleaños DUOC";
        }
      }

      const percent = userDiscountPercent;
      const base = Math.max(0, subTotal - bdayDisc);
      const discountFromItems = items.reduce((sum, entry) => sum + (entry.pricing?.discountTotal ?? 0), 0);
      const userDisc = percent > 0 ? Math.min(base, discountFromItems) : 0;
      let userLabel = "";
      if (percent > 0) {
        const age = computeAge(customerSession?.fnac ?? "");
        const percentLabel = `${Math.round(percent * 100)}% OFF`;
        if (typeof age === "number" && age >= 50 && Math.round(percent * 100) >= 50) {
          userLabel = `Beneficio Adulto Mayor (${percentLabel})`;
        } else if (customerSession?.felices50) {
          userLabel = `Beneficio FELICES50 (${percentLabel})`;
        } else {
          userLabel = `Beneficio de usuario (${percentLabel})`;
        }
      }

      return {
        userDisc,
        userLabel,
        bdayDisc,
        bdayLabel,
        bdayEligible: eligibleToday,
        bdayApplied,
        freeShipping,
        shippingLabel
      };
    },
    [birthdayRewardEligible, birthdayRewardAvailable, userDiscountPercent, customerSession?.fnac, customerSession?.felices50]
  );

<<<<<<< HEAD
  const registerCustomer = useCallback<ContextValue["registerCustomer"]>(
    (payload) => {
      const email = payload.email.trim().toLowerCase();
      if (!isEmailAllowed(email)) {
        return { ok: false, message: "Correo no permitido." };
      }
      if (!isRunValid(payload.run)) {
        return { ok: false, message: "RUN inválido." };
      }
      if (customers.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, message: "Este correo ya está registrado." };
      }
      const now = Date.now();
      const defaultShip = normalizeShipCost(payload.prefs?.defaultShip);
      const trimmedDireccion = payload.direccion?.trim() || "";
      const trimmedRegion = payload.region?.trim() || "";
      const trimmedComuna = payload.comuna?.trim() || "";

      const baseAddress: UserAddress | null =
        trimmedDireccion && trimmedRegion && trimmedComuna
          ? {
              id: generateAddressId(),
              alias: payload.prefs?.addresses?.[0]?.alias?.trim() || "Dirección principal",
              direccion: trimmedDireccion,
              region: trimmedRegion,
              comuna: trimmedComuna,
              referencia: payload.prefs?.addresses?.[0]?.referencia?.trim() || undefined,
              createdAt: now,
              updatedAt: now
            }
          : null;

      let normalizedPrefs: UserPreferences | undefined;
      const incomingAddresses = payload.prefs?.addresses;
      const sanitizedAddresses = incomingAddresses?.length
        ? sanitizeIncomingAddresses(incomingAddresses, undefined, now)
        : baseAddress
          ? [baseAddress]
          : [];

      if (payload.prefs || sanitizedAddresses.length || defaultShip !== DEFAULT_SHIPPING_COST) {
        const basePrefs = { ...payload.prefs } satisfies UserPreferences;
        basePrefs.defaultShip = defaultShip;
        if (sanitizedAddresses.length) {
          basePrefs.addresses = sanitizedAddresses;
          const preferredId = basePrefs.primaryAddressId;
          basePrefs.primaryAddressId = preferredId && sanitizedAddresses.some((addr) => addr.id === preferredId)
            ? preferredId
            : sanitizedAddresses[0]?.id;
        } else {
          delete basePrefs.addresses;
          delete basePrefs.primaryAddressId;
        }
        normalizedPrefs = basePrefs;
      }

      const nuevo: CustomerUser = {
        run: cleanRun(payload.run),
        tipo: payload.tipo,
        nombre: payload.nombre,
        apellidos: payload.apellidos,
        email,
        fnac: payload.fnac,
        region: trimmedRegion,
        comuna: trimmedComuna,
        direccion: trimmedDireccion,
        phone: payload.phone?.trim() || undefined,
        pass: payload.pass,
        promoCode: payload.promoCode?.toUpperCase() || "",
        // FELICES50 is only applied at registration
        felices50: payload.promoCode?.toUpperCase() === FELICES_CODE,
        createdAt: payload.createdAt ?? now,
        bdayRedeemedYear: payload.bdayRedeemedYear ?? null,
        prefs: normalizedPrefs,
        status: "active"
      };
      setCustomers((prev) => [...prev, nuevo]);
      setCustomerSession({
        email: nuevo.email,
        nombre: nuevo.nombre,
        fnac: nuevo.fnac,
        promoCode: nuevo.promoCode,
        felices50: nuevo.felices50,
        bdayRedeemedYear: nuevo.bdayRedeemedYear,
        prefs: nuevo.prefs,
        status: nuevo.status
      });
      return { ok: true };
    },
    [customers]
  );

  const loginCustomer = useCallback<ContextValue["loginCustomer"]>(
    (email, password) => {
      const normalized = email.trim().toLowerCase();
      const user = customers.find(
        (u) => u.email.toLowerCase() === normalized && u.pass === password
      );
      if (!user) {
        return { ok: false, message: "Credenciales inválidas." };
      }
      // Merge guest cart into user cart on login
      try {
        const guest = readJSON<CartItem[]>(CART_KEY, []);
        const userKey = `${CART_KEY}_${normalized}`;
        const existing = readJSON<CartItem[]>(userKey, []);

        if (!existing.length && guest.length) {
          const map = new Map<string, CartItem>();
          guest.forEach((item) => {
            const key = `${item.id}::${item.msg || ""}`;
            const prev = map.get(key);
            if (prev) {
              map.set(key, { ...prev, qty: prev.qty + item.qty });
            } else {
              map.set(key, { ...item });
            }
          });
          const migrated = Array.from(map.values());
          writeJSON(userKey, migrated);
          removeKey(CART_KEY);
          setCart(migrated);
        } else {
          setCart(existing);
          if (!existing.length && guest.length === 0) {
            removeKey(CART_KEY);
          }
        }
      } catch (err) {
        // ignore merge errors
        console.warn("Cart merge failed:", err);
      }

      setCustomerSession({
        email: user.email,
        nombre: user.nombre,
        fnac: user.fnac,
        promoCode: user.promoCode,
        felices50: user.felices50,
        bdayRedeemedYear: user.bdayRedeemedYear,
        prefs: user.prefs,
        status: normalizeStatus(user.status)
      });
      return { ok: true };
    },
    [customers]
  );

  const logoutCustomer = useCallback(() => {
    setCustomerSession(null);
    setCart([]);
  }, []);

  const updateCustomer = useCallback(
    (updates: Partial<CustomerUser>) => {
      if (!customerSession) return;
      setCustomers((prev) => {
        const idx = prev.findIndex((u) => u.email.toLowerCase() === customerSession.email.toLowerCase());
        if (idx === -1) return prev;
        const current = prev[idx];
        const now = Date.now();
        const safeUpdates: Partial<CustomerUser> = { ...updates };

        if (
          typeof safeUpdates.promoCode === "string" &&
          safeUpdates.promoCode.toUpperCase() === FELICES_CODE &&
          !current.felices50
        ) {
          delete safeUpdates.promoCode;
        }

        if (typeof safeUpdates.nombre === "string") {
          safeUpdates.nombre = safeUpdates.nombre.trim();
        }
        if (typeof safeUpdates.apellidos === "string") {
          safeUpdates.apellidos = safeUpdates.apellidos.trim();
        }
        if (typeof safeUpdates.direccion === "string") {
          safeUpdates.direccion = safeUpdates.direccion.trim();
        }
        if (typeof safeUpdates.phone === "string") {
          safeUpdates.phone = safeUpdates.phone.trim() || undefined;
        }

        let nextPrefs: UserPreferences | undefined = current.prefs ? { ...current.prefs } : undefined;
        if (safeUpdates.prefs) {
          nextPrefs = { ...nextPrefs, ...safeUpdates.prefs };
          nextPrefs.defaultShip = normalizeShipCost(nextPrefs.defaultShip);

          if (safeUpdates.prefs.addresses) {
            const sanitized = sanitizeIncomingAddresses(
              safeUpdates.prefs.addresses,
              current.prefs?.addresses,
              now
            );
            nextPrefs.addresses = sanitized.length ? sanitized : undefined;
          }

          let candidatePrimary = safeUpdates.prefs.primaryAddressId ?? nextPrefs?.primaryAddressId ?? current.prefs?.primaryAddressId;
          const addressList = nextPrefs?.addresses ?? current.prefs?.addresses ?? [];
          if (addressList.length) {
            if (!candidatePrimary || !addressList.some((addr) => addr.id === candidatePrimary)) {
              candidatePrimary = addressList[0].id;
            }
            nextPrefs = {
              ...nextPrefs,
              addresses: addressList,
              primaryAddressId: candidatePrimary
            };
            if (candidatePrimary) {
              const primary = addressList.find((addr) => addr.id === candidatePrimary);
              if (primary) {
                if (!safeUpdates.direccion) safeUpdates.direccion = primary.direccion;
                if (!safeUpdates.region) safeUpdates.region = primary.region;
                if (!safeUpdates.comuna) safeUpdates.comuna = primary.comuna;
              }
            }
          } else if (nextPrefs) {
            delete nextPrefs.primaryAddressId;
          }

          safeUpdates.prefs = nextPrefs;
        }

        const merged: CustomerUser = {
          ...current,
          ...safeUpdates,
          prefs: safeUpdates.prefs ?? nextPrefs ?? current.prefs
        };
        merged.felices50 = !!current.felices50;

        const next = [...prev];
        next[idx] = merged;
        setCustomerSession({
          email: merged.email,
          nombre: merged.nombre,
          fnac: merged.fnac,
          promoCode: merged.promoCode,
          felices50: merged.felices50,
          bdayRedeemedYear: merged.bdayRedeemedYear,
          prefs: merged.prefs,
          status: normalizeStatus(merged.status)
        });
        return next;
      });
    },
    [customerSession]
  );

  // Admin helpers to manage customers (edit/delete from admin)
  const upsertCustomer = useCallback((user: CustomerUser) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          ...user,
          status: normalizeStatus(user.status ?? next[idx].status)
        };
        return next;
      }
      return [...prev, { ...user, status: normalizeStatus(user.status) }];
    });
  }, []);

  const removeCustomer = useCallback((email: string) => {
    setCustomers((prev) => prev.filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
  }, []);

  const setCustomerStatus = useCallback(
    (email: string, status: AccountStatus) => {
      const normalized = normalizeStatus(status);
      setCustomers((prev) =>
        prev.map((user) =>
          user.email.toLowerCase() === email.toLowerCase()
            ? { ...user, status: normalized }
            : user
        )
      );
      setCustomerSession((prev) => {
        if (!prev || prev.email.toLowerCase() !== email.toLowerCase()) return prev;
        return { ...prev, status: normalized };
      });
    },
    []
  );

  const upsertAdminUser = useCallback(
    (user: AdminUser) => {
      setAdminUsers((prev) => {
        const idx = prev.findIndex((u) => u.run.toUpperCase() === user.run.toUpperCase());
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...user };
          return next;
        }
        return [...prev, user];
      });
    },
    []
  );

  const removeAdminUser = useCallback(
    (run: string) => {
      setAdminUsers((prev) => prev.filter((u) => u.run.toUpperCase() !== run.toUpperCase()));
    },
    []
  );

  const adminLogin = useCallback<ContextValue["adminLogin"]>(
    (email, _password) => {
      const normalized = email.trim().toLowerCase();
      const user = adminUsers.find((u) => (u.correo || "").toLowerCase() === normalized);
      if (!user) {
        return { ok: false, message: "Usuario no encontrado." };
      }
      const session: AdminSession = {
        correo: user.correo,
        nombre: user.nombre,
        rol: user.rol
      };
      setAdminSession(session);
      return { ok: true };
    },
    [adminUsers]
  );

  const adminLogout = useCallback(() => setAdminSession(null), []);

  const updateOrders = useCallback((nextOrders: Order[]) => {
    setOrders(nextOrders);
  }, []);

  const addComment = useCallback<ContextValue["addComment"]>(
    (postId, text) => {
      const session = customerSession;
      if (!session) {
        return { ok: false, message: "Debes iniciar sesión para comentar." };
      }
      const body = text.trim();
      if (!body) {
        return { ok: false, message: "Escribe algo." };
      }
      if (body.length > 300) {
        return { ok: false, message: "Máximo 300 caracteres." };
      }
      const ownerId = session.email.toLowerCase();
      const comment: BlogComment = {
        id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ownerId,
        authorEmail: ownerId,
        authorName: session.nombre?.trim() || session.email.split("@")[0],
        text: body,
        ts: Date.now(),
        editedAt: null
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      return { ok: true };
    },
    [customerSession]
  );

  const editComment = useCallback(
    (postId: string, id: string, text: string) => {
      const session = customerSession;
      if (!session) return;
      const normalized = session.email.toLowerCase();
      setComments((prev) => {
        const list = prev[postId] || [];
        const updated = list.map((comment) =>
          comment.id === id && comment.ownerId === normalized
            ? { ...comment, text: text.trim(), editedAt: Date.now() }
            : comment
        );
        return { ...prev, [postId]: updated };
      });
    },
    [customerSession]
  );

  const deleteComment = useCallback(
    (postId: string, id: string) => {
      const session = customerSession;
      if (!session) return;
      const normalized = session.email.toLowerCase();
      setComments((prev) => {
        const list = prev[postId] || [];
        const filtered = list.filter((comment) => !(comment.id === id && comment.ownerId === normalized));
        return { ...prev, [postId]: filtered };
      });
    },
    [customerSession]
  );

  const openReceiptWindow = useCallback<ContextValue["openReceiptWindow"]>(
    ({ items, subTotal, effectiveSubtotal, benefits, coupon, shipCost, total, contactEmail }) => {
      const normalizedEmail =
        typeof contactEmail === "string" && contactEmail.trim()
          ? contactEmail.trim()
          : customerSession?.email || null;
      const html = buildReceiptHTML({
        items: items.map((entry) => ({
          product: entry.product,
          qty: entry.qty,
          msg: entry.msg,
          subtotal: entry.pricing.total,
          originalSubtotal: entry.subtotal,
          unitPrice: entry.pricing.unitPrice,
          originalUnitPrice: entry.pricing.originalUnitPrice
        })),
        subTotal,
        effectiveSubtotal,
        benefits,
        coupon,
        shipCost,
        total,
        currentEmail: normalizedEmail
      });
      const win = window.open("", "_blank");
      if (!win) {
        showNotification({
          message: "Permite las ventanas emergentes para ver el detalle.",
          kind: "info",
          mode: "dialog",
          actionLabel: "Aceptar"
        });
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    },
    [customerSession, showNotification]
  );

  const value = useMemo<ContextValue>(
=======
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((entry) => entry.id !== id));
    const timer = notificationTimers.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete notificationTimers.current[id];
    }
  }, []);

  const showNotification = useCallback(
    (payload: NotificationPayload) => {
      const id = `nt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const entry: AppNotification = {
        id,
        message: payload.message,
        kind: payload.kind ?? "info",
        mode: payload.mode ?? "toast",
        actionLabel: payload.actionLabel,
        cancelLabel: payload.cancelLabel,
        onAction: payload.onAction,
        onCancel: payload.onCancel,
        durationMs: payload.durationMs,
        input: payload.input
      };
      setNotifications((prev) => [...prev, entry]);
      if (entry.mode !== "dialog") {
        const timeout = window.setTimeout(() => {
          dismissNotification(id);
        }, entry.durationMs ?? 4000);
        notificationTimers.current[id] = timeout;
      }
    },
    [dismissNotification]
  );

  const mapPreferencesFromProfile = useCallback((profile: CustomerUser | null) => {
    if (!profile?.prefs) return;
    if (profile.prefs.defaultShip) {
      setShippingCostState(normalizeShipCost(profile.prefs.defaultShip));
    }
  }, []);

  const hydrateForAuth = useCallback(async (state: AuthState) => {
    if (!state.token || !state.role) {
      setCustomerProfile(null);
      setCustomers([]);
      setAdminUsers([]);
      setAdminSession(null);
      setOrders([]);
      return;
    }

    if (state.role === "CUSTOMER") {
      try {
        const [profileDto, ordersDto] = await Promise.all([
          fetchCurrentCustomer(state.token),
          fetchMyOrders(state.token)
        ]);
        const profile = mapCustomerProfile(profileDto);
        setCustomerProfile(profile);
        setCustomers([]);
        setAdminUsers([]);
        setAdminSession(null);
        setOrders(ordersDto.map(mapOrder));
        mapPreferencesFromProfile(profile);
      } catch (error) {
        console.error("No se pudo obtener el perfil del cliente", error);
        showNotification({ message: extractErrorMessage(error, "No se pudo cargar tu perfil"), kind: "error" });
        setAuth(EMPTY_AUTH);
        saveAuthToSession(EMPTY_AUTH);
      }
    } else {
      try {
        const [staffDto, customersDto, ordersDto] = await Promise.all([
          fetchStaff(state.token),
          fetchAdminCustomers(state.token),
          fetchAllOrders(state.token)
        ]);
        const staff = staffDto.map(mapStaff);
        setAdminUsers(staff);
        const staffDtoMatch = staffDto.find((s) => s.id === state.userId);
        // Normalize email beforehand to avoid calling toLowerCase on undefined when no match exists.
        const dtoEmail = staffDtoMatch?.email?.toLowerCase() ?? "";
        const currentStaff = staff.find((entry) => entry.id === state.userId || (entry.correo?.toLowerCase() ?? "") === dtoEmail);
        setAdminSession(
          currentStaff
            ? { correo: currentStaff.correo, nombre: `${currentStaff.nombre} ${currentStaff.apellidos}`.trim(), rol: currentStaff.rol }
            : { correo: "admin", nombre: "Administrador", rol: "Administrador" }
        );
        setCustomerProfile(null);
        setCustomers(customersDto.map(mapCustomerSummary));
        setOrders(ordersDto.map(mapOrder));
      } catch (error) {
        console.error("No se pudieron cargar los datos administrativos", error);
        showNotification({ message: extractErrorMessage(error, "No se pudo cargar el panel"), kind: "error" });
        setAuth(EMPTY_AUTH);
        saveAuthToSession(EMPTY_AUTH);
      }
    }
  }, [mapPreferencesFromProfile, showNotification]);

  const applyAuthState = useCallback(
    async (state: AuthState, options?: { hydrate?: boolean }) => {
      setAuth(state);
      saveAuthToSession(state);
      if (options?.hydrate ?? true) {
        await hydrateForAuth(state);
      }
    },
    [hydrateForAuth]
  );

  useEffect(() => () => {
    const timers = notificationTimers.current;
    for (const id of Object.keys(timers)) {
      window.clearTimeout(timers[id]);
    }
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const performRefresh = useCallback(async () => {
    clearRefreshTimer();
    if (!auth.refreshToken) {
      return;
    }
    if (!auth.refreshExpiresAt || auth.refreshExpiresAt <= Date.now()) {
      await applyAuthState(EMPTY_AUTH);
      showNotification({ message: "Tu sesión expiró. Inicia sesión nuevamente.", kind: "info" });
      return;
    }
    try {
      const response = await refreshAuth(auth.refreshToken);
      const role = response.role === "ADMIN" || response.role === "CUSTOMER" ? (response.role as AuthRole) : null;
      if (!role) {
        throw new Error("Rol de autenticación no soportado");
      }
      await applyAuthState(
        {
          token: response.token,
          refreshToken: response.refreshToken,
          role,
          userId: response.userId,
          expiresAt: response.expiresAt,
          refreshExpiresAt: response.refreshExpiresAt
        },
        { hydrate: false }
      );
    } catch (error) {
      console.error("No se pudo refrescar la sesión", error);
      await applyAuthState(EMPTY_AUTH);
      showNotification({ message: "Tu sesión expiró. Inicia sesión nuevamente.", kind: "info" });
    }
  }, [auth.refreshToken, auth.refreshExpiresAt, applyAuthState, showNotification, clearRefreshTimer]);

  const refreshProducts = useCallback(async () => {
    try {
      const remote = await fetchProducts();
      setProducts(remote);
    } catch (error) {
      console.error("No se pudieron cargar los productos desde el backend", error);
      showNotification({ message: "No se pudo cargar el catálogo", kind: "error" });
    }
  }, [showNotification]);

  useEffect(() => {
    clearRefreshTimer();
    if (!auth.token || !auth.refreshToken || !auth.expiresAt) {
      return;
    }
    if (auth.refreshExpiresAt && auth.refreshExpiresAt <= Date.now()) {
      void performRefresh();
      return;
    }
    const now = Date.now();
    const bufferMs = 60_000;
    const delay = Math.max(5_000, auth.expiresAt - now - bufferMs);
    if (delay <= 0) {
      void performRefresh();
      return;
    }
    refreshTimerRef.current = window.setTimeout(() => {
      void performRefresh();
    }, delay);
    return () => {
      clearRefreshTimer();
    };
  }, [auth.token, auth.refreshToken, auth.expiresAt, auth.refreshExpiresAt, clearRefreshTimer, performRefresh]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const refreshCoupons = useCallback(async () => {
    try {
      const remote = await fetchCoupons();
      setCouponDefinitions(remote);
    } catch (error) {
      console.error("No se pudieron cargar los cupones desde el backend", error);
      showNotification({ message: "No se pudieron cargar los cupones", kind: "error" });
    }
  }, [showNotification]);

  useEffect(() => {
    void refreshCoupons();
  }, [refreshCoupons]);

  const addToCart = useCallback(
    (id: string, qty = 1, msg = "") => {
      const product = products.find((p) => p.id === id);
      if (!product) {
        showNotification({ message: "Este producto ya no está disponible.", kind: "error" });
        return;
      }
      if (customerProfile?.status === "inactive") {
        showNotification({
          message: "Tu cuenta está desactivada. Contáctanos para reactivarla.",
          kind: "error",
          mode: "dialog",
          actionLabel: "Entendido"
        });
        return;
      }
      if (product.stock <= 0) {
        showNotification({ message: "Sin stock disponible.", kind: "error" });
        return;
      }
      const isBirthdayCake = product.id === BDAY_CAKE_ID;
      if (isBirthdayCake && !birthdayRewardAvailable) {
        showNotification({
          message: "Ya reclamaste esta torta por tu cumpleaños.",
          kind: "info",
          mode: "dialog"
        });
        return;
      }
      const desired = Math.max(1, Number(qty));
      let outcome: { addedQty: number; status: "none" | "added" | "partial" | "noStock" } = {
        addedQty: 0,
        status: "none"
      };
      setCart((prev) => {
        const idx = prev.findIndex((item) => item.id === id && (item.msg || "") === msg);
        const currentQty = idx >= 0 ? prev[idx].qty : 0;
        const limit = isBirthdayCake ? Math.min(1, product.stock) : product.stock;
        const remaining = Math.max(0, limit - currentQty);
        if (remaining <= 0) {
          outcome = { addedQty: 0, status: "noStock" };
          return prev;
        }
        const toAdd = Math.min(desired, remaining);
        if (toAdd <= 0) {
          outcome = { addedQty: 0, status: "noStock" };
          return prev;
        }
        outcome = {
          addedQty: toAdd,
          status: toAdd < desired ? "partial" : "added"
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + toAdd };
          return next;
        }
        return [...prev, { id, qty: toAdd, msg }];
      });
      if (outcome.status === "noStock") {
        showNotification({ message: "Sin stock disponible.", kind: "error" });
        return;
      }
      if (outcome.addedQty > 0) {
        const message =
          outcome.status === "partial"
            ? `Solo pudimos agregar ${outcome.addedQty} unidad(es). Stock disponible: ${product.stock}.`
            : `${product.nombre} añadido al carrito.`;
        showNotification({ message, kind: "success", mode: "dialog", actionLabel: "OK" });
      }
    },
    [products, showNotification, birthdayRewardAvailable, customerProfile?.status]
  );

  const setCartQty = useCallback(
    (id: string, qty: number, msg = "") => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      if (customerProfile?.status === "inactive") {
        showNotification({
          message: "Tu cuenta está desactivada. No puedes modificar el carrito.",
          kind: "error",
          mode: "dialog",
          actionLabel: "Entendido"
        });
        return;
      }
      const isBirthdayCake = product.id === BDAY_CAKE_ID;
      const desiredRaw = Math.floor(Number.isFinite(qty) ? qty : 0);
      const desired = product.stock > 0 ? Math.max(1, desiredRaw) : 0;
      const max = isBirthdayCake ? Math.min(1, product.stock) : product.stock;
      const nextQty = Math.min(desired, max);
      if (desired > max) {
        showNotification({ message: `Stock disponible: ${max}`, kind: "info" });
      }
      setCart((prev) => {
        const idx = prev.findIndex((item) => item.id === id && (item.msg || "") === msg);
        if (idx === -1) return prev;
        const next = [...prev];
        if (nextQty === 0 || (isBirthdayCake && !birthdayRewardAvailable)) {
          next.splice(idx, 1);
        } else {
          next[idx] = { ...next[idx], qty: nextQty };
        }
        return next;
      });
    },
    [products, showNotification, birthdayRewardAvailable, customerProfile?.status]
  );

  const removeFromCart = useCallback((id: string, msg = "") => {
    setCart((prev) => prev.filter((item) => !(item.id === id && (item.msg || "") === msg)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  useEffect(() => {
    if (initialHydrated) return;
    setInitialHydrated(true);
    if (auth.token && auth.role) {
      void hydrateForAuth(auth);
    }
  }, [auth, hydrateForAuth, initialHydrated]);

  const registerCustomer = useCallback<ContextValue["registerCustomer"]>(
    async (payload) => {
      try {
        const request: CustomerRegistrationRequestDto = {
          run: payload.run,
          firstName: payload.nombre,
          lastName: payload.apellidos,
          email: payload.email,
          password: payload.pass ?? "",
          customerType: payload.tipo ?? "Cliente",
          birthDate: payload.fnac || null,
          region: payload.region || null,
          commune: payload.comuna || null,
          address: payload.direccion || null,
          phone: payload.phone || null,
          promoCode: payload.promoCode || null,
          defaultShippingCost: payload.prefs?.defaultShip ?? DEFAULT_SHIPPING_COST,
          newsletter: payload.prefs?.newsletter ?? false,
          saveAddress: payload.prefs?.saveAddress ?? false,
          birthdayRedeemedYear: payload.bdayRedeemedYear ?? null,
          addresses: payload.prefs?.addresses?.map((addr) => ({
            id: addr.id ?? null,
            alias: addr.alias ?? null,
            direccion: addr.direccion,
            region: addr.region,
            comuna: addr.comuna,
            referencia: addr.referencia ?? null,
            primary: payload.prefs?.primaryAddressId ? addr.id === payload.prefs.primaryAddressId : false
          })) ?? undefined
        };

        if (!request.addresses && payload.direccion && payload.region && payload.comuna) {
          request.addresses = [
            {
              id: null,
              alias: payload.prefs?.addresses?.[0]?.alias ?? "Dirección principal",
              direccion: payload.direccion,
              region: payload.region,
              comuna: payload.comuna,
              referencia: payload.prefs?.addresses?.[0]?.referencia ?? null,
              primary: true
            }
          ];
        }

        await apiRegisterCustomer(request);

        const loginResult = await login({ email: payload.email, password: payload.pass ?? "" });
        if (loginResult.role !== "CUSTOMER") {
          return { ok: false, message: "El usuario creado no tiene perfil de cliente" };
        }

        await applyAuthState({
          token: loginResult.token,
          refreshToken: loginResult.refreshToken,
          role: loginResult.role as AuthRole,
          userId: loginResult.userId,
          expiresAt: loginResult.expiresAt,
          refreshExpiresAt: loginResult.refreshExpiresAt
        });

        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No pudimos registrar la cuenta") };
      }
    },
    [applyAuthState]
  );

  const loginCustomer = useCallback<ContextValue["loginCustomer"]>(
    async (email, password) => {
      try {
        const response = await login({ email, password });
        if (response.role !== "CUSTOMER") {
          return { ok: false, message: "Estas credenciales no pertenecen a un cliente" };
        }
        await applyAuthState({
          token: response.token,
          refreshToken: response.refreshToken,
          role: "CUSTOMER",
          userId: response.userId,
          expiresAt: response.expiresAt,
          refreshExpiresAt: response.refreshExpiresAt
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "Credenciales inválidas") };
      }
    },
    [applyAuthState]
  );

  const adminLogin = useCallback<ContextValue["adminLogin"]>(
    async (email, password) => {
      try {
        const response = await login({ email, password });
        if (response.role !== "ADMIN") {
          return { ok: false, message: "No tienes permisos administrativos" };
        }
        await applyAuthState({
          token: response.token,
          refreshToken: response.refreshToken,
          role: "ADMIN",
          userId: response.userId,
          expiresAt: response.expiresAt,
          refreshExpiresAt: response.refreshExpiresAt
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "Credenciales inválidas") };
      }
    },
    [applyAuthState]
  );

  const logoutCustomer = useCallback(async () => {
    setCart([]);
    await applyAuthState(EMPTY_AUTH);
  }, [applyAuthState]);

  const adminLogout = useCallback(async () => {
    await applyAuthState(EMPTY_AUTH);
  }, [applyAuthState]);

  const upsertProduct = useCallback<ContextValue["upsertProduct"]>(
    async (product, options) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      try {
        const normalized: Product =
          product.id === BDAY_CAKE_ID ? { ...product, precio: 0 } : product;
        if (options?.isNew || !products.some((item) => item.id === product.id)) {
          await apiCreateProduct(normalized, auth.token);
        } else {
          await apiUpdateProduct(normalized, auth.token);
        }
        await refreshProducts();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo guardar el producto") };
      }
    },
    [auth.token, auth.role, products, refreshProducts]
  );

  const removeProduct = useCallback<ContextValue["removeProduct"]>(
    async (id) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      try {
        await apiDeleteProduct(id, auth.token);
        await refreshProducts();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo eliminar el producto") };
      }
    },
    [auth.token, auth.role, refreshProducts]
  );

  const updateCustomer = useCallback<ContextValue["updateCustomer"]>(
    async (updates) => {
      if (!auth.token || auth.role !== "CUSTOMER") {
        return { ok: false, message: "Inicia sesión como cliente" };
      }
      try {
        const request: CustomerUpdateRequestDto = {};
        if (updates.nombre !== undefined) request.firstName = updates.nombre;
        if (updates.apellidos !== undefined) request.lastName = updates.apellidos;
        if (updates.email !== undefined) request.email = updates.email;
        if (updates.region !== undefined) request.region = updates.region;
        if (updates.comuna !== undefined) request.commune = updates.comuna;
        if (updates.direccion !== undefined) request.address = updates.direccion;
        if (updates.phone !== undefined) request.phone = updates.phone;
        if (updates.promoCode !== undefined) request.promoCode = updates.promoCode;
        if (updates.tipo !== undefined) request.customerType = updates.tipo;
        if (updates.fnac !== undefined) request.birthDate = updates.fnac || null;
        if (updates.bdayRedeemedYear !== undefined) request.birthdayRedeemedYear = updates.bdayRedeemedYear ?? null;
        if (updates.prefs?.defaultShip !== undefined) request.defaultShippingCost = updates.prefs?.defaultShip ?? DEFAULT_SHIPPING_COST;
        if (updates.prefs?.newsletter !== undefined) request.newsletter = updates.prefs.newsletter;
        if (updates.prefs?.saveAddress !== undefined) request.saveAddress = updates.prefs.saveAddress;
        if (updates.felices50 !== undefined) request.felices50 = updates.felices50;
        if (updates.prefs?.primaryAddressId !== undefined) request.primaryAddressId = updates.prefs.primaryAddressId ?? null;
        if (updates.prefs?.addresses) {
          request.addresses = updates.prefs.addresses.map((addr) => ({
            id: addr.id,
            alias: addr.alias ?? null,
            direccion: addr.direccion,
            region: addr.region,
            comuna: addr.comuna,
            referencia: addr.referencia ?? null,
            primary: updates.prefs?.primaryAddressId ? addr.id === updates.prefs.primaryAddressId : false
          }));
        }

        const profileDto = await updateCurrentCustomer(request, auth.token);
        const mapped = mapCustomerProfile(profileDto);
        setCustomerProfile(mapped);
        mapPreferencesFromProfile(mapped);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No pudimos actualizar tu perfil") };
      }
    },
    [auth.token, auth.role, mapPreferencesFromProfile]
  );

  const upsertCustomer = useCallback<ContextValue["upsertCustomer"]>(
    async (user) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      try {
        if (!user.id) {
          return { ok: false, message: "No se encontró el identificador del cliente" };
        }
        const request: CustomerUpdateRequestDto = {
          firstName: user.nombre,
          lastName: user.apellidos,
          email: user.email,
          region: user.region,
          commune: user.comuna,
          address: user.direccion,
          phone: user.phone ?? null,
          promoCode: user.promoCode ?? null,
          customerType: user.tipo ?? "Cliente",
          birthDate: user.fnac || null,
          birthdayRedeemedYear: user.bdayRedeemedYear ?? null,
          defaultShippingCost: user.prefs?.defaultShip ?? DEFAULT_SHIPPING_COST,
          newsletter: user.prefs?.newsletter ?? false,
          saveAddress: user.prefs?.saveAddress ?? false
        };
        if (user.prefs?.addresses) {
          request.addresses = user.prefs.addresses.map((addr) => ({
            id: addr.id,
            alias: addr.alias ?? null,
            direccion: addr.direccion,
            region: addr.region,
            comuna: addr.comuna,
            referencia: addr.referencia ?? null,
            primary: user.prefs?.primaryAddressId ? addr.id === user.prefs.primaryAddressId : false
          }));
        }
        const summaryDto = await updateCustomerByAdmin(user.id, request, auth.token);
        setCustomers((prev) => {
          const others = prev.filter((entry) => entry.id !== summaryDto.id);
          return [...others, mapCustomerSummary(summaryDto)].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo actualizar el cliente") };
      }
    },
    [auth.token, auth.role]
  );

  const removeCustomer = useCallback((email: string) => {
    setCustomers((prev) => prev.filter((user) => user.email.toLowerCase() !== email.toLowerCase()));
  }, []);

  const setCustomerStatus = useCallback<ContextValue["setCustomerStatus"]>(
    async (email, status) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      const target = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
      if (!target?.id) {
        return { ok: false, message: "Cliente no encontrado" };
      }
      try {
        await updateCustomerStatus(target.id, { status: status === "inactive" ? "INACTIVE" : "ACTIVE" }, auth.token);
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === target.id ? { ...customer, status } : customer
          )
        );
        if (customerProfile?.id === target.id) {
          setCustomerProfile({ ...customerProfile, status });
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo cambiar el estado") };
      }
    },
    [auth.token, auth.role, customers, customerProfile]
  );

  const upsertAdminUser = useCallback<ContextValue["upsertAdminUser"]>(
    async (user) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      try {
        if (user.id) {
          const payload: StaffUpdateRequestDto = {
            firstName: user.nombre,
            lastName: user.apellidos,
            email: user.correo,
            password: user.password ?? undefined,
            staffRole: user.rol,
            region: user.region ?? null,
            commune: user.comuna ?? null,
            address: user.direccion ?? null,
            phone: user.phone ?? null,
            active: user.status !== "inactive"
          };
          const dto = await updateStaff(user.id, payload, auth.token);
          setAdminUsers((prev) => {
            const others = prev.filter((entry) => entry.id !== user.id);
            return [...others, mapStaff(dto)];
          });
        } else {
          const payload: StaffRequestDto = {
            run: user.run,
            firstName: user.nombre,
            lastName: user.apellidos,
            email: user.correo,
            password: user.password || `${user.run}-Temp1`,
            staffRole: user.rol,
            region: user.region ?? null,
            commune: user.comuna ?? null,
            address: user.direccion ?? null,
            phone: user.phone ?? null
          };
          const dto = await createStaff(payload, auth.token);
          setAdminUsers((prev) => [...prev, mapStaff(dto)]);
        }
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo guardar al colaborador") };
      }
    },
    [auth.token, auth.role]
  );

  const removeAdminUser = useCallback<ContextValue["removeAdminUser"]>(
    async (run) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "Inicia sesión como administrador" };
      }
      const staff = adminUsers.find((user) => user.run.toUpperCase() === run.toUpperCase());
      if (!staff?.id) {
        return { ok: false, message: "Colaborador no encontrado" };
      }
      try {
        await deleteStaff(staff.id, auth.token);
        setAdminUsers((prev) => prev.filter((user) => user.id !== staff.id));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo eliminar al colaborador") };
      }
    },
    [auth.token, auth.role, adminUsers]
  );

  const refreshOrders = useCallback<ContextValue["refreshOrders"]>(
    async () => {
      if (!auth.token || !auth.role) return;
      try {
        if (auth.role === "CUSTOMER") {
          const ordersDto = await fetchMyOrders(auth.token);
          setOrders(ordersDto.map(mapOrder));
        } else {
          const ordersDto = await fetchAllOrders(auth.token);
          setOrders(ordersDto.map(mapOrder));
        }
      } catch (error) {
        showNotification({ message: extractErrorMessage(error, "No se pudieron cargar las órdenes"), kind: "error" });
      }
    },
    [auth.token, auth.role, showNotification]
  );

  const changeOrderStatus = useCallback<ContextValue["changeOrderStatus"]>(
    async (orderId, nextStatusLabel) => {
      if (!auth.token || auth.role !== "ADMIN") {
        return { ok: false, message: "No tienes permisos" };
      }
      const status = ORDER_LABEL_TO_STATUS[nextStatusLabel] ?? ORDER_LABEL_TO_STATUS[nextStatusLabel.trim()] ?? null;
      if (!status) {
        return { ok: false, message: "Estado inválido" };
      }
      try {
        const updated = await apiUpdateOrderStatus(orderId, { status }, auth.token);
        setOrders((prev) => {
          const others = prev.filter((order) => order.id !== updated.orderCode && order.id !== updated.id);
          return [mapOrder(updated), ...others].sort((a, b) => b.createdAt - a.createdAt);
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo actualizar el estado") };
      }
    },
    [auth.token, auth.role]
  );

  const addComment = useCallback<ContextValue["addComment"]>(
    async (postSlug, text) => {
      if (!auth.token || auth.role === null) {
        return { ok: false, message: "Debes iniciar sesión para comentar." };
      }
      const content = text.trim();
      if (!content) {
        return { ok: false, message: "Escribe algo." };
      }
      if (content.length > 500) {
        return { ok: false, message: "Máximo 500 caracteres." };
      }
      try {
        const comment = await apiCreateBlogComment(postSlug, content, auth.token);
        setComments((prev) => ({
          ...prev,
          [postSlug]: [...(prev[postSlug] || []), comment]
        }));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No pudimos publicar tu comentario") };
      }
    },
    [auth.token, auth.role]
  );

  const hydrateComments = useCallback((postSlug: string, list: BlogComment[]) => {
    setComments((prev) => ({ ...prev, [postSlug]: list }));
  }, []);

  const editComment = useCallback<ContextValue["editComment"]>(
    async (postSlug, id, text) => {
      if (!auth.token) {
        return { ok: false, message: "Debes iniciar sesión." };
      }
      const content = text.trim();
      if (!content) {
        return { ok: false, message: "El comentario no puede estar vacío." };
      }
      try {
        const updated = await apiUpdateBlogComment(id, content, auth.token);
        setComments((prev) => {
          const list = prev[postSlug] || [];
          const next = list.map((comment) => (comment.id === updated.id ? updated : comment));
          return { ...prev, [postSlug]: next };
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo editar el comentario") };
      }
    },
    [auth.token]
  );

  const deleteComment = useCallback<ContextValue["deleteComment"]>(
    async (postSlug, id) => {
      if (!auth.token) {
        return { ok: false, message: "Debes iniciar sesión." };
      }
      try {
        await apiDeleteBlogComment(id, auth.token);
        setComments((prev) => {
          const list = prev[postSlug] || [];
          return { ...prev, [postSlug]: list.filter((comment) => comment.id !== id) };
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo eliminar el comentario") };
      }
    },
    [auth.token]
  );

  const openReceiptWindow = useCallback<ContextValue["openReceiptWindow"]>((order) => {
    const html = buildReceiptHTML({
      items: order.items.map((item) => ({
        product: {
          id: item.codigo,
          nombre: item.nombre,
          precio: item.originalUnitPrice,
          categoria: "",
          attr: "",
          img: "",
          stock: 0,
          stockCritico: 0
        },
        qty: item.qty,
        msg: undefined,
        subtotal: item.subtotal,
        originalSubtotal: item.originalSubtotal,
        unitPrice: item.unitPrice,
        originalUnitPrice: item.originalUnitPrice
      })),
      subTotal: order.subtotal,
      effectiveSubtotal: order.subtotal - order.discountTotal,
      benefits: {
        userDisc: 0,
        userLabel: "",
        bdayDisc: 0,
        bdayLabel: "",
        bdayEligible: false,
        bdayApplied: false,
        freeShipping: false,
        shippingLabel: ""
      },
      coupon: { valid: Boolean(order.couponCode), discount: order.discountTotal, shipAfter: order.shippingCost, code: order.couponCode, label: order.couponLabel },
      shipCost: order.shippingCost,
      total: order.total,
      currentEmail: order.customerEmail ?? customerProfile?.email ?? null
    });
    const win = window.open("", "_blank");
    if (!win) {
      showNotification({ message: "Permite las ventanas emergentes para ver el detalle.", kind: "info", mode: "dialog", actionLabel: "Aceptar" });
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }, [customerProfile, showNotification]);

  const placeOrder = useCallback<ContextValue["placeOrder"]>(
    async (request) => {
      if (!auth.token || auth.role !== "CUSTOMER") {
        return { ok: false, message: "Debes iniciar sesión como cliente." };
      }
      try {
        const response = await apiCreateOrder(request, auth.token);
        const mapped = mapOrder(response);
        setOrders((prev) => [mapped, ...prev].sort((a, b) => b.createdAt - a.createdAt));
        await refreshProducts();
        return { ok: true, order: mapped };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error, "No se pudo crear la orden") };
      }
    },
    [auth.token, auth.role, refreshProducts]
  );

  const placeOrderAndRefresh = useCallback(async (request: CreateOrderRequestDto) => {
    const result = await placeOrder(request);
    if (result.ok) {
      await refreshOrders();
    }
    return result;
  }, [placeOrder, refreshOrders]);

  const contextValue = useMemo<ContextValue>(
>>>>>>> master
    () => ({
      products,
      storefrontProducts,
      refreshProducts,
      upsertProduct,
      removeProduct,
      cart,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      cartTotals,
      shippingCost,
      setShippingCost,
      coupon,
      setCoupon,
      evaluateCoupon,
      benefitsForCart,
      userDiscountPercent,
      getProductPricing,
      notifications,
      showNotification,
      dismissNotification,
      customerSession,
      customers,
      currentCustomer,
      birthdayRewardEligible,
      birthdayRewardAvailable,
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomer,
      upsertCustomer,
      removeCustomer,
      setCustomerStatus,
      adminUsers,
      upsertAdminUser,
      removeAdminUser,
      adminSession,
      adminLogin,
      adminLogout,
      orders,
<<<<<<< HEAD
      updateOrders,
      comments,
      addComment,
      editComment,
      deleteComment,
      openReceiptWindow
=======
      refreshOrders,
      changeOrderStatus,
      comments,
      addComment,
      hydrateComments,
      editComment,
      deleteComment,
      openReceiptWindow,
      placeOrder: placeOrderAndRefresh
>>>>>>> master
    }),
    [
      products,
      storefrontProducts,
      refreshProducts,
      upsertProduct,
      removeProduct,
      cart,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      cartTotals,
      shippingCost,
      setShippingCost,
      coupon,
      setCoupon,
      evaluateCoupon,
      benefitsForCart,
      userDiscountPercent,
      getProductPricing,
      notifications,
      showNotification,
      dismissNotification,
      customerSession,
      customers,
      currentCustomer,
      birthdayRewardEligible,
      birthdayRewardAvailable,
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomer,
      upsertCustomer,
      removeCustomer,
      setCustomerStatus,
<<<<<<< HEAD
      setCustomerStatus,
=======
>>>>>>> master
      adminUsers,
      upsertAdminUser,
      removeAdminUser,
      adminSession,
      adminLogin,
      adminLogout,
      orders,
<<<<<<< HEAD
      updateOrders,
      comments,
      addComment,
      editComment,
      deleteComment,
      openReceiptWindow
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
=======
      refreshOrders,
      changeOrderStatus,
      comments,
      addComment,
      hydrateComments,
      editComment,
      deleteComment,
      openReceiptWindow,
      placeOrderAndRefresh
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
>>>>>>> master
}

export function useAppContext(): ContextValue {
  const ctx = useContext(AppContext);
<<<<<<< HEAD
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
=======
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
>>>>>>> master
  return ctx;
}
