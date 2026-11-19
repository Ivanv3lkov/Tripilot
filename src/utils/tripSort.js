export const SORT_OPTIONS = [
  { value: "newest", labelKey: "sort.newest", icon: "arrow-down-outline" },
  { value: "oldest", labelKey: "sort.oldest", icon: "arrow-up-outline" },
  { value: "rating", labelKey: "sort.rating", icon: "star-outline" },
  { value: "title", labelKey: "sort.title_az", icon: "text-outline" },
];

const COMPARATORS = {
  newest: (a, b) => b.visitDate.localeCompare(a.visitDate),
  oldest: (a, b) => a.visitDate.localeCompare(b.visitDate),
  rating: (a, b) => b.rating - a.rating || b.visitDate.localeCompare(a.visitDate),
  title: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
};

export function sortTrips(trips, sortBy) {
  return [...trips].sort(COMPARATORS[sortBy] ?? COMPARATORS.newest);
}

export function getSortLabelKey(sortBy) {
  return SORT_OPTIONS.find((option) => option.value === sortBy)?.labelKey ?? "sort.newest";
}
