import { CATEGORIES } from "../constants/trips";
import { fromDateOnly, todayDateOnly } from "./date";

const MONTHS_IN_CHART = 6;

// "Rome, Italy" -> "Italy". The form requires the "City, Country" format.
export function getCountry(location) {
  const parts = location.split(",");
  return parts[parts.length - 1].trim();
}

function countBy(items, getKey) {
  const counts = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

export function getAverageRating(trips) {
  const rated = trips.filter((trip) => trip.rating > 0);
  if (rated.length === 0) return null;
  const total = rated.reduce((sum, trip) => sum + trip.rating, 0);
  return Math.round((total / rated.length) * 10) / 10;
}

export function getCountryCount(trips) {
  return new Set(trips.map((trip) => getCountry(trip.location).toLowerCase()))
    .size;
}

function getMonthlyCounts(trips, now, locale) {
  const counts = countBy(trips, (trip) => trip.visitDate.slice(0, 7));
  return Array.from({ length: MONTHS_IN_CHART }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (MONTHS_IN_CHART - 1 - index),
      1,
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: date.toLocaleDateString(locale, { month: "short" }),
      count: counts.get(key) ?? 0,
    };
  });
}

export function getCountries(trips) {
  const names = new Map();
  const counts = countBy(trips, (trip) => {
    const country = getCountry(trip.location);
    const key = country.toLowerCase();
    if (!names.has(key)) names.set(key, country);
    return key;
  });
  return [...counts.entries()]
    .map(([key, count]) => ({ name: names.get(key), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function getHighlights(trips) {
  const today = todayDateOnly();
  const byDate = [...trips].sort((a, b) =>
    a.visitDate.localeCompare(b.visitDate),
  );
  const topRated = [...trips]
    .filter((trip) => trip.rating > 0)
    .sort(
      (a, b) => b.rating - a.rating || b.visitDate.localeCompare(a.visitDate),
    )[0];

  return {
    topRated: topRated ?? null,
    nextTrip: byDate.find((trip) => trip.visitDate > today) ?? null,
    firstTrip: byDate[0] ?? null,
  };
}

export function getTripStats(trips, locale = "en-GB", now = new Date()) {
  const categoryCounts = countBy(trips, (trip) => trip.category);

  return {
    total: trips.length,
    favorites: trips.filter((trip) => trip.isFavorite).length,
    countries: getCountryCount(trips),
    averageRating: getAverageRating(trips),
    monthly: getMonthlyCounts(trips, now, locale),
    topCountries: getCountries(trips).slice(0, 5),
    categories: CATEGORIES.map((category) => ({
      ...category,
      count: categoryCounts.get(category.value) ?? 0,
    })),
    highlights: getHighlights(trips),
  };
}

export function getMonthLabel(dateOnly, locale = "en-GB") {
  return fromDateOnly(dateOnly).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}
