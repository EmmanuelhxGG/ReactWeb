import type { CouponInfo } from "../types";

export const COUPONS: Record<string, CouponInfo> = {
  ENVIOGRATIS: { type: "ship", value: 0, label: "Envío gratis", code: "ENVIOGRATIS" },
  "5000OFF": { type: "amount", value: 5000, label: "$5.000 OFF", code: "5000OFF" }
};
