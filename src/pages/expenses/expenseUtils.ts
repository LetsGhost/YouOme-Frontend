export function isSettledStatus(status: string | undefined) {
  const normalized = (status || "pending").toLowerCase();
  return normalized === "settled" || normalized === "paid" || normalized === "completed";
}
