import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";
import { MAX_RATING } from "../constants/trips";

// Read-only by default. Pass onChange to let the user pick a rating; tapping
// the current rating again clears it.
function RatingStars({ rating, size = 14, onChange }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row" style={{ gap: onChange ? 6 : 2 }}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const value = index + 1;
        const star = (
          <Ionicons
            name={value <= rating ? "star" : "star-outline"}
            size={size}
            color={value <= rating ? colors.star : colors.starEmpty}
          />
        );
        if (!onChange) return <View key={value}>{star}</View>;
        return (
          <Pressable
            key={value}
            onPress={() => onChange(value === rating ? 0 : value)}
            accessibilityRole="button"
            accessibilityLabel={t("rating.rateLabel", { value, max: MAX_RATING })}
            hitSlop={4}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

export default RatingStars;
