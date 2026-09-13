import type { Gage } from "@/lib/db/schema";
import { GAGE_STATUSES } from "@/lib/gages";

export const CSV_HEADERS = [
  "shop_id",
  "name",
  "type",
  "manufacturer",
  "serial",
  "location",
  "last_cal",
  "next_due",
  "status",
  "notes",
] as const;

export type CsvGageRow = {
  shopId: string;
  name: string;
  type: string;
  manufacturer: string | null;
  serial: string | null;
  location: string;
  lastCal: string | null;
  nextDue: string | null;
  status: "available" | "out_of_service";
  notes: string | null;
};

function escapeCsv(value: string | null | undefined) {
  const text = value ?? "";
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function gagesToCsv(rows: Gage[]) {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.shopId,
        row.name,
        row.type,
        row.manufacturer,
        row.serial,
        row.location,
        row.lastCal,
        row.nextDue,
        row.status,
        row.notes,
      ]
        .map((value) => escapeCsv(value))
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeStatus(value: string | undefined): CsvGageRow["status"] {
  const raw = (value ?? "available").trim().toLowerCase();
  if (raw === "out_of_service" || raw === "out of service" || raw === "out") {
    return "out_of_service";
  }
  if (GAGE_STATUSES.includes(raw as CsvGageRow["status"])) {
    return raw as CsvGageRow["status"];
  }
  return "available";
}

export function parseGageCsv(text: string): { rows: CsvGageRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], errors: ["CSV is empty."] };
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const index = (name: string) => headers.indexOf(name);
  const shopIdx = index("shop_id") >= 0 ? index("shop_id") : index("id");
  const nameIdx = index("name");
  if (shopIdx < 0 || nameIdx < 0) {
    return { rows: [], errors: ["CSV must include shop_id and name columns."] };
  }

  const rows: CsvGageRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  lines.slice(1).forEach((line, offset) => {
    const cells = splitCsvLine(line);
    const shopId = cells[shopIdx]?.trim();
    const name = cells[nameIdx]?.trim();
    const lineNo = offset + 2;
    if (!shopId || !name) {
      errors.push(`Line ${lineNo}: shop_id and name are required.`);
      return;
    }
    if (seen.has(shopId.toLowerCase())) {
      errors.push(`Line ${lineNo}: duplicate shop_id ${shopId}.`);
      return;
    }
    seen.add(shopId.toLowerCase());
    rows.push({
      shopId,
      name,
      type: emptyToNull(cells[index("type")]) ?? "Equipment",
      manufacturer: emptyToNull(cells[index("manufacturer")]),
      serial: emptyToNull(cells[index("serial")]),
      location: emptyToNull(cells[index("location")]) ?? "Quality Lab",
      lastCal: emptyToNull(cells[index("last_cal")]),
      nextDue: emptyToNull(cells[index("next_due")]),
      status: normalizeStatus(cells[index("status")]),
      notes: emptyToNull(cells[index("notes")]),
    });
  });

  return { rows, errors };
}
