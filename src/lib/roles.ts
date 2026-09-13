export const ROLES = ["admin", "quality", "operator"] as const;
export type Role = (typeof ROLES)[number];

export function canEditGages(role: Role) {
  return role === "admin" || role === "quality";
}

export function canImportExport(role: Role) {
  return role === "admin" || role === "quality";
}

export function canUpdateStatus(role: Role) {
  return role === "admin" || role === "quality" || role === "operator";
}

export function canMoveLocation(role: Role) {
  return canUpdateStatus(role);
}

export function canSeeDueWeekInbox(role: Role) {
  return role === "admin";
}

export function canMoveTools(role: Role) {
  return role === "admin" || role === "quality" || role === "operator";
}

export function canEditTools(role: Role) {
  return role === "admin" || role === "quality";
}

export function isRole(value: string | undefined | null): value is Role {
  return value === "admin" || value === "quality" || value === "operator";
}
