import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";

// fill: the chip takes the full width of its parent (used in grids): icon above
// a centered one-line label. The font size is always the same.
function Chip({ label, icon, active = false, onPress, fill = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`items-center ${fill ? "w-full justify-center gap-1 rounded-2xl px-1 py-2.5" : "mb-2 mr-2 flex-row gap-1.5 rounded-full px-4 py-2.5"} ${active ? "bg-foreground" : "bg-secondary"}`}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={fill ? 18 : 14}
          color={active ? colors.white : colors.textMuted}
        />
      ) : null}
      <Text
        className={`text-[12px] font-bold ${active ? "text-white" : "text-muted-foreground"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default Chip;
