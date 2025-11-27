export function timeAgo(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60_000) return "justo ahora";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}
