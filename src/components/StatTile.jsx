import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";

// Small summary tile. When onPress is set it opens the related list.
function StatTile({ icon, value, label, highlight = false, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${label}: ${value}`}
      className={`flex-1 rounded-2xl px-3 py-2.5 active:opacity-80 ${highlight ? "bg-primary" : "bg-card"}`}
    >
      <View className="flex-row items-center justify-between">
        <Ionicons name={icon} size={16} color={highlight ? colors.white : colors.primary} />
        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={highlight ? colors.white : colors.textMuted}
          />
        ) : null}
      </View>
      <Text className={`mt-1 text-lg font-extrabold ${highlight ? "text-white" : ""}`}>{value}</Text>
      <Text
        className={`text-[11px] font-semibold ${highlight ? "text-white/80" : "text-muted-foreground"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default StatTile;
