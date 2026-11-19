// Trip dates are calendar dates ("YYYY-MM-DD") without a time zone, so they are
// converted to and from local Date objects instead of using UTC parsing.

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDateOnly(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateOnly(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayDateOnly() {
  return toDateOnly(new Date());
}

export function isUpcoming(value) {
  return value > todayDateOnly();
}

// locale: "en-GB" or "bg-BG" (from useTranslation).
export function formatDate(value, locale = "en-GB") {
  return fromDateOnly(value).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(value, locale = "en-GB") {
  return fromDateOnly(value).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
  });
}
