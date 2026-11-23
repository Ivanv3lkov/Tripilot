import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";

function HeartButton({ active, onPress, size = 36 }) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={active ? t("favorites.remove") : t("favorites.add")}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      className={`items-center justify-center rounded-full active:opacity-70 ${active ? "bg-white" : "bg-black/35"}`}
      style={{ width: size, height: size }}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={size * 0.55}
        color={active ? colors.primary : colors.white}
      />
    </Pressable>
  );
}

export default HeartButton;
