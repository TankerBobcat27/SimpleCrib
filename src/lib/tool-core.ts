export const MAX_TOOL_LOCATIONS = 5;
export const DEFAULT_CRIB_LOCATION = "Crib A";

export const TOOL_TYPES = [
  "End mill",
  "Insert",
  "Tool holder",
  "Drill",
  "Tap",
  "Collet",
  "Face mill",
  "Setup",
  "Other",
] as const;

export const SUGGESTED_DESTINATIONS = [
  "Crib A",
  "Crib B",
  "Haas VF-2",
  "Doosan Lynx",
  "DMU75",
  "Bench",
  "Tool cart",
  "Incoming",
] as const;

export type LocationSplit = { name: string; qty: number };
export type MoveIntent = "checkout" | "checkin";
export type MoveError = "missing" | "qty" | "same" | "source" | "stock" | "locations" | "not-found";

export type ToolCard = {
  id: string;
  toolNumber: string;
  name: string;
  type: string;
  manufacturer: string | null;
  notes: string | null;
  locations: LocationSplit[];
  totalQty: number;
};

export function normalizeLocation(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isCribLocation(name: string) {
  return /^crib\b/i.test(normalizeLocation(name));
}

export function sortLocations(locations: LocationSplit[]) {
  return [...locations].sort((a, b) => {
    const cribDiff = Number(isCribLocation(b.name)) - Number(isCribLocation(a.name));
    if (cribDiff !== 0) return cribDiff;
    return a.name.localeCompare(b.name);
  });
}

export function applyLocationMove(
  locations: LocationSplit[],
  from: string,
  to: string,
  qty: number,
): { ok: true; locations: LocationSplit[] } | { ok: false; error: MoveError } {
  const sourceName = normalizeLocation(from);
  const destName = normalizeLocation(to);
  if (!sourceName || !destName) {
    return { ok: false, error: "missing" };
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, error: "qty" };
  }
  if (sourceName.toLowerCase() === destName.toLowerCase()) {
    return { ok: false, error: "same" };
  }

  const next = locations
    .map((loc) => ({ name: normalizeLocation(loc.name), qty: loc.qty }))
    .filter((loc) => loc.qty > 0);

  const source = next.find((loc) => loc.name.toLowerCase() === sourceName.toLowerCase());
  if (!source) return { ok: false, error: "source" };
  if (source.qty < qty) return { ok: false, error: "stock" };

  source.qty -= qty;
  const dest = next.find((loc) => loc.name.toLowerCase() === destName.toLowerCase());
  if (dest) {
    dest.qty += qty;
  } else {
    next.push({ name: destName, qty });
  }

  const remaining = sortLocations(next.filter((loc) => loc.qty > 0));
  if (remaining.length > MAX_TOOL_LOCATIONS) {
    return { ok: false, error: "locations" };
  }
  return { ok: true, locations: remaining };
}

export function defaultCheckoutSource(locations: LocationSplit[]) {
  return (
    locations.find((loc) => isCribLocation(loc.name) && loc.qty > 0)?.name ??
    locations.find((loc) => loc.qty > 0)?.name ??
    DEFAULT_CRIB_LOCATION
  );
}

export function defaultCheckinSource(locations: LocationSplit[]) {
  return (
    locations.find((loc) => !isCribLocation(loc.name) && loc.qty > 0)?.name ??
    locations.find((loc) => loc.qty > 0)?.name ??
    ""
  );
}

export function defaultCheckinDestination(locations: LocationSplit[]) {
  return locations.find((loc) => isCribLocation(loc.name))?.name ?? DEFAULT_CRIB_LOCATION;
}

export function knownDestinations(tenantLocations: string[]) {
  const names = new Set<string>([...SUGGESTED_DESTINATIONS, ...tenantLocations]);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function moveErrorMessage(error: string | undefined) {
  switch (error) {
    case "missing":
      return "Enter a quantity and a destination location.";
    case "qty":
      return "Quantity must be a whole number of 1 or more.";
    case "same":
      return "Source and destination have to be different.";
    case "source":
      return "That source location is not on this tool.";
    case "stock":
      return "Not enough quantity at the source location.";
    case "locations":
      return `A tool can sit in up to ${MAX_TOOL_LOCATIONS} locations. Return some first.`;
    case "not-found":
      return "That tool is not in this shop.";
    case "duplicate":
      return "That tool number already exists in this shop.";
    case "forbidden":
      return "You cannot move tools with this role.";
    default:
      return null;
  }
}

export function moveOkMessage(ok: string | undefined, toolNumber?: string) {
  const label = toolNumber ? ` ${toolNumber}` : "";
  if (ok === "checkout") return `Checked out${label}. Location chips updated.`;
  if (ok === "checkin") return `Returned${label} to the destination. Location chips updated.`;
  if (ok === "created") return `Added tool${label} to the crib.`;
  return null;
}

export function toolCounts(items: Array<{ locations: LocationSplit[]; totalQty: number }>) {
  const floor = items.filter((tool) => tool.locations.some((loc) => !isCribLocation(loc.name))).length;
  return {
    all: items.length,
    pcs: items.reduce((sum, tool) => sum + tool.totalQty, 0),
    onFloor: floor,
  };
}
