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
import type {
  AccountStatus,
  AdminSession,
  AdminUser,
  BlogComment,
  CartItem,
  CartTotals,
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
const FELICES_CODE = "FELICES50";
const BDAY_CAKE_ID = "BDAY001";
const SENIOR_DISCOUNT = 0.5;
const PROMO_DISCOUNT = 0.1;
const DEFAULT_SHIPPING_COST = 3000;
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

export type { AppNotification, NotificationPayload, DialogInputConfig };

type ContextValue = {
  products: Product[];
  storefrontProducts: Product[];
  refreshProducts: () => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
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
    if (!customerSession) return 0;
    const age = computeAge(customerSession.fnac ?? "");
    if (typeof age === "number" && age > 50) return SENIOR_DISCOUNT;
    if (customerSession.promoCode === FELICES_CODE || customerSession.felices50) {
      return PROMO_DISCOUNT;
    }
    return 0;
  }, [customerSession]);

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
      const definition = COUPONS[code];
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
    [coupon]
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
      updateOrders,
      comments,
      addComment,
      editComment,
      deleteComment,
      openReceiptWindow
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
      setCustomerStatus,
      adminUsers,
      upsertAdminUser,
      removeAdminUser,
      adminSession,
      adminLogin,
      adminLogout,
      orders,
      updateOrders,
      comments,
      addComment,
      editComment,
      deleteComment,
      openReceiptWindow
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): ContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
