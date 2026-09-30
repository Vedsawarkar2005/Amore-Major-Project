/** Whole rupees as printed on the site, e.g. `₹349` or `₹1,299`. */
export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** A position as two digits, e.g. `01`, for numbered lists and cards. */
export function formatIndex(n: number) {
  return String(n).padStart(2, "0");
}
