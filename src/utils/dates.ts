export function parseLocalDate(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function computeAge(iso: string | undefined | null): number | null {
  const birth = parseLocalDate(iso);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isBirthdayToday(iso: string | undefined | null): boolean {
  const birth = parseLocalDate(iso);
  if (!birth) return false;
  const today = new Date();
  return (
    birth.getDate() === today.getDate() &&
    birth.getMonth() === today.getMonth()
  );
}
