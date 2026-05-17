export function formatSeconds(seconds: number) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "€ 0.00";
  }

  const parsed = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, ""));

  if (Number.isNaN(parsed)) {
    return String(value);
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(parsed);
}

export function formatCount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  return String(value);
}