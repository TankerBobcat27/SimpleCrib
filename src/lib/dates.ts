export type DueBucket = "overdue" | "this_week" | "due_soon" | "current" | "missing";

export function todayIso(now = new Date()) {
  return toIsoDate(now);
}

export function toIsoDate(value: Date | string | null | undefined) {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string | null | undefined) {
  const iso = toIsoDate(value);
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function endOfWeek(now = new Date()) {
  return addDays(startOfWeek(now), 6);
}

export function daysUntil(iso: string | null | undefined, now = new Date()) {
  const due = parseIsoDate(iso);
  if (!due) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - start.getTime()) / 86_400_000);
}

export function dueBucket(iso: string | null | undefined, now = new Date()): DueBucket {
  if (!iso) return "missing";
  const remaining = daysUntil(iso, now);
  if (remaining === null) return "missing";
  if (remaining < 0) return "overdue";
  const weekEnd = endOfWeek(now);
  const due = parseIsoDate(iso);
  if (due && due <= weekEnd) return "this_week";
  if (remaining <= 30) return "due_soon";
  return "current";
}

export function dueLabel(iso: string | null | undefined, now = new Date()) {
  const remaining = daysUntil(iso, now);
  if (remaining === null) return "No due date";
  if (remaining < 0) return `Overdue · ${Math.abs(remaining)}d`;
  if (remaining === 0) return "Due today";
  if (remaining === 1) return "Due tomorrow";
  return `Due in ${remaining}d`;
}

export function formatDate(iso: string | null | undefined) {
  return toIsoDate(iso) ?? "—";
}
