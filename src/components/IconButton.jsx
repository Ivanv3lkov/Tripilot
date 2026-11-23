import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { colors, softShadow } from "../constants/theme";

// Round white button; `variant="glass"` is for use on top of photos.
function IconButton({ icon, label, onPress, color = colors.text, variant = "solid", size = 42, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className={`items-center justify-center rounded-full active:opacity-70 ${variant === "glass" ? "bg-black/35" : "bg-card"} ${disabled ? "opacity-50" : ""}`}
      style={[{ width: size, height: size }, variant === "solid" ? softShadow : null]}
    >
      <Ionicons name={icon} size={size * 0.5} color={variant === "glass" ? colors.white : color} />
    </Pressable>
  );
}

export default IconButton;
