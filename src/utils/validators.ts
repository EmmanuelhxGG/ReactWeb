const EMAIL_REGEX = /@(?:duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
const RUN_CLEAN = /[^0-9Kk]/g;

export function isEmailAllowed(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function cleanRun(run: string): string {
  return run.toUpperCase().replace(RUN_CLEAN, "");
}

export function formatRun(run: string): string {
  const cleaned = cleanRun(run);
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const groups: string[] = [];
  for (let i = body.length; i > 0; i -= 3) {
    const start = Math.max(i - 3, 0);
    groups.unshift(body.slice(start, i));
  }
  const formattedBody = groups.join(".");
  return formattedBody ? `${formattedBody}-${dv}` : cleaned;
}

export function isRunValid(run: string): boolean {
  const cleaned = cleanRun(run);
  if (cleaned.length < 7 || cleaned.length > 9) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]!, 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest);
  return expected === dv;
}
