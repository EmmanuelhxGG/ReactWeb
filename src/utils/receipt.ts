import { formatMoney } from "./format";
import type { Product, UserBenefits } from "../types";

type ReceiptItem = {
  product: Product;
  qty: number;
  msg?: string;
  subtotal: number;
  originalSubtotal?: number;
  unitPrice?: number;
  originalUnitPrice?: number;
};

type CouponSummary = {
  valid: boolean;
  discount: number;
  shipAfter: number;
  label?: string;
  code?: string;
};

type ReceiptPayload = {
  items: ReceiptItem[];
  subTotal: number;
  effectiveSubtotal: number;
  shipCost: number;
  total: number;
  benefits: UserBenefits;
  coupon: CouponSummary;
  currentEmail?: string | null;
};

export function buildReceiptHTML(payload: ReceiptPayload): string {
  const { items, subTotal, effectiveSubtotal, shipCost, total, benefits, coupon, currentEmail } = payload;
  const { userDisc, userLabel, bdayDisc, bdayLabel } = benefits;
  const rows = items
    .map((item) => {
      const { product, qty, subtotal, msg } = item;
      const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : product.precio;
      const originalUnit = typeof item.originalUnitPrice === "number" ? item.originalUnitPrice : product.precio;
      const hasUnitDiscount = originalUnit > unitPrice;
      const originalSubtotal = typeof item.originalSubtotal === "number" ? item.originalSubtotal : product.precio * qty;
      const hasSubtotalDiscount = originalSubtotal > subtotal;
      const attr = product.attr ? ` • ${product.attr}` : "";
      const extra = msg ? `<div class="small">🎂 Mensaje: ${msg}</div>` : "";
      const priceColumn = hasUnitDiscount
        ? `<div><s class="muted">${formatMoney(originalUnit)}</s></div><div><strong>${formatMoney(unitPrice)}</strong></div>`
        : `<strong>${formatMoney(unitPrice)}</strong>`;
      const subtotalColumn = hasSubtotalDiscount
        ? `<div><s class="muted">${formatMoney(originalSubtotal)}</s></div><div><strong>${formatMoney(subtotal)}</strong></div>`
        : `<strong>${formatMoney(subtotal)}</strong>`;
      return `
        <tr>
          <td>
            <div><strong>${product.nombre}</strong></div>
            <div class="muted small">${product.categoria}${attr}</div>
            ${extra}
          </td>
          <td class="ta-right">${priceColumn}</td>
          <td class="ta-center">${qty}</td>
          <td class="ta-right">${subtotalColumn}</td>
        </tr>
      `;
    })
    .join("");

  const now = new Date();
  const lines: string[] = [];
  const subtotalRow = benefits.userDisc > 0
    ? `<div class="row"><span>Subtotal</span><span class="price-col"><s class="muted">${formatMoney(subTotal)}</s><strong>${formatMoney(effectiveSubtotal)}</strong></span></div>`
    : `<div class="row"><span>Subtotal</span><strong>${formatMoney(subTotal)}</strong></div>`;
  lines.push(subtotalRow);
  if (bdayDisc > 0) {
    lines.push(
      `<div class="row"><span>${bdayLabel || "Beneficio cumpleaños"}</span><strong>- ${formatMoney(bdayDisc)}</strong></div>`
    );
  }
  if (userDisc > 0) {
    lines.push(
      `<div class="row"><span>${userLabel || "Descuento usuario"}</span><strong>- ${formatMoney(userDisc)}</strong></div>`
    );
  }
  if (coupon.valid && coupon.discount > 0) {
    lines.push(
      `<div class="row"><span>${coupon.label || "Cupón"}${
        coupon.code ? ` (${coupon.code})` : ""
      }</span><strong>- ${formatMoney(coupon.discount)}</strong></div>`
    );
  }
  lines.push(`<div class="row"><span>Envío</span><strong>${formatMoney(shipCost)}</strong></div>`);
  lines.push(`<div class="row total"><span>Total</span><strong>${formatMoney(total)}</strong></div>`);

  const fecha = now.toLocaleString("es-CL");
  const cliente = currentEmail ? ` &nbsp;•&nbsp; Cliente: ${currentEmail}` : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Detalle de compra · Mil Sabores</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family: Lato, Arial, sans-serif; background:#faf7f2; margin:0; color:#2f2a25;}
    .wrap{max-width:860px;margin:24px auto;padding:24px;background:#fff;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.08)}
    h1{font-size:22px;margin:0 0 8px}
    .muted{color:#7a766f}
    .small{font-size:12px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{padding:10px;border-bottom:1px solid #eee;vertical-align:top}
    th{background:#faf7f2;text-align:left}
    .ta-right{text-align:right}
    .ta-center{text-align:center}
    .sum{margin-top:8px}
    .sum .row{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 0}
    .price-col{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
    .total{font-weight:700;font-size:18px;border-top:1px dashed #ddd;padding-top:10px;margin-top:6px}
    .btns{display:flex;gap:10px;margin-top:16px}
    button{padding:10px 14px;border-radius:10px;border:1px solid #ddd;cursor:pointer;background:#fff}
    .primary{background:#8c4b27;color:#fff;border-color:#8c4b27}
    @media print {.btns{display:none}}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Detalle de la compra</h1>
    <div class="muted small">Fecha: ${fecha}${cliente}</div>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th class="ta-right">Precio</th>
          <th class="ta-center">Cant.</th>
          <th class="ta-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="sum">${lines.join("")}</div>
    <div class="btns">
      <button class="primary" onclick="window.print()">Imprimir / Guardar PDF</button>
      <button onclick="window.close()">Cerrar</button>
    </div>
  </div>
</body>
</html>`;
}
