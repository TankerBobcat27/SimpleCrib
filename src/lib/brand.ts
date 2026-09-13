/**
 * Locked product brand. Domain: simplecrib.com (registered).
 * UI copy should keep using brand.productName so strings stay consistent.
 */
export const brand = {
  productName: "SimpleCrib",
  productLine: "Calibration",
  toolcribLine: "Toolcrib",
  shortLine: "Shop Apps",
  domain: "simplecrib.com",
} as const;

export type ProductLine = typeof brand.productLine | typeof brand.toolcribLine;

export function productMark(line: ProductLine = brand.productLine) {
  return `${brand.productName} · ${line}`;
}

export function productTitle(line: ProductLine = brand.productLine) {
  return `${brand.productName} ${line}`;
}

export function productLineTitle(line: ProductLine = brand.productLine) {
  return line === brand.toolcribLine ? "Toolcrib" : `${line} Tracker`;
}
