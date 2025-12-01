import type { CouponInfo } from "../types";
import { request } from "./http";

type CouponResponse = {
  code: string;
  type: "ship" | "amount" | string;
  value: number;
  label: string;
};

export async function fetchCoupons(): Promise<Record<string, CouponInfo>> {
  const data = await request<CouponResponse[]>("/api/v1/coupons");
  return data.reduce<Record<string, CouponInfo>>((acc, coupon) => {
    const normalizedType = coupon.type === "ship" || coupon.type === "amount" ? coupon.type : "amount";
    acc[coupon.code.toUpperCase()] = {
      code: coupon.code.toUpperCase(),
      type: normalizedType,
      value: coupon.value,
      label: coupon.label
    } satisfies CouponInfo;
    return acc;
  }, {});
}

export async function fetchCoupon(code: string): Promise<CouponInfo> {
  const response = await request<CouponResponse>(`/api/v1/coupons/${code}`);
  const normalizedType = response.type === "ship" || response.type === "amount" ? response.type : "amount";
  return {
    code: response.code.toUpperCase(),
    type: normalizedType,
    value: response.value,
    label: response.label
  } satisfies CouponInfo;
}
