/**
 * Locked product brand. Domain: simplecrib.com (registered).
 * UI copy should keep using brand.productName so strings stay consistent.
 */
export const brand = {
  productName: "SimpleCrib",
  productLine: "Calibration",
  shortLine: "Shop Apps",
  domain: "simplecrib.com",
} as const;

export function productMark() {
  return `${brand.productName} · ${brand.productLine}`;
}

export function productTitle() {
  return `${brand.productName} ${brand.productLine}`;
}

export function productLineTitle() {
  return `${brand.productLine} Tracker`;
}
