// Must match the category check constraint on public.trips.
export const CATEGORIES = [
  { value: "City", icon: "business-outline" },
  { value: "Nature", icon: "leaf-outline" },
  { value: "Beach", icon: "umbrella-outline" },
  { value: "History", icon: "library-outline" },
  { value: "Food", icon: "restaurant-outline" },
  { value: "Mountains", icon: "trail-sign-outline" },
  { value: "Culture", icon: "color-palette-outline" },
  { value: "Adventure", icon: "compass-outline" },
  { value: "Relax", icon: "cafe-outline" },
  { value: "Ski", icon: "snow-outline" },
  { value: "Family", icon: "people-outline" },
  { value: "Festival", icon: "musical-notes-outline" },
];

export const CATEGORY_VALUES = CATEGORIES.map((category) => category.value);

export function getCategoryIcon(value) {
  return (
    CATEGORIES.find((category) => category.value === value)?.icon ??
    "pricetag-outline"
  );
}

export const MAX_RATING = 5;

// Must match the limit trigger on public.attraction_photos.
export const MAX_ATTRACTION_PHOTOS = 3;
