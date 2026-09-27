export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export type Due = { label: string; tone: "overdue" | "today" | "soon" | "later" | "none" };

export function dueInfo(iso?: string | null): Due {
  if (!iso) return { label: "No date", tone: "none" };
  const today = todayISO();
  if (iso === today) return { label: "Today", tone: "today" };
  if (iso === addDaysISO(1)) return { label: "Tomorrow", tone: "soon" };
  if (iso < today) return { label: "Overdue", tone: "overdue" };
  const [y, m, d] = iso.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, tone: "later" };
}