// "Olive" palette. Raw values for places that cannot use className (icons,
// RefreshControl, gradients, shadows). Keep in sync with global.css.
export const colors = {
  primary: "#5B6E2E",
  primaryDark: "#3F4D1F",
  accentSoft: "#E6EBD4",
  sand: "#EFF0E4",
  background: "#F8F7F0",
  surface: "#FFFFFF",
  text: "#1F2416",
  textMuted: "#6B705C",
  border: "#E3E3D3",
  danger: "#B4442F",
  star: "#D4A017",
  starEmpty: "#DCDCCB",
  white: "#FFFFFF",
};

export const softShadow = {
  shadowColor: "#2C3418",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

// Dark fade at the bottom of photos so white text stays readable.
export const photoScrim = ["transparent", "rgba(31, 36, 22, 0.85)"];
