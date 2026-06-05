export const APP_TIME_ZONE = "Europe/Madrid";

export function madridDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function previousMadridDateKey(dateKey: string): string {
  const noonUtc = new Date(`${dateKey}T12:00:00.000Z`);
  noonUtc.setUTCDate(noonUtc.getUTCDate() - 1);
  return madridDateKey(noonUtc);
}
