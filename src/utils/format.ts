export function formatMoney(value: number, locale = "es-CL"): string {
  return (value || 0).toLocaleString(locale, {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  });
}

export function describeBenefitLabel(label: string): { title: string; detail?: string } {
  const text = label?.trim() || "";
  if (!text) {
    return { title: "" };
  }
  const base = text.replace(/\s*\([^)]*\)\s*$/, "");
  const percent = text.match(/(\d{1,3})\s*%/);
  if (/env[ií]o gratis/i.test(text)) {
    return { title: base || text, detail: "Envío sin costo" };
  }
  if (percent) {
    return { title: base || text, detail: `${percent[1]}% de descuento` };
  }
  if (/cup[oó]n/i.test(text)) {
    return { title: base || text, detail: "Cupón aplicado" };
  }
  const amountMatch = text.match(/\$\s*(\d{1,3}(?:[.,]\d{3})*)/);
  if (amountMatch) {
    return { title: base || text, detail: `${amountMatch[0]} de descuento` };
  }
  return { title: base || text };
}
