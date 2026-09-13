/**
 * Working product title — not a locked brand.
 * Rename here only; UI should not hardcode a company/product name.
 * Do not buy a domain from this string.
 */
export const brand = {
  productName: "SimpleCrib",
  productLine: "Calibration",
  shortLine: "Shop Apps",
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
