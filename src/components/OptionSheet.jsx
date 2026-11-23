import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";

// Simple bottom sheet with a list of options (sorting, avatar actions).
// option: { value, label, icon, destructive?, selected? }
function OptionSheet({ visible, title, options, onSelect, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose} accessibilityLabel="Close">
        <Pressable
          className="rounded-t-[32px] bg-background px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
          onPress={() => {}}
        >
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-border" />
          <Text className="mb-3 text-lg font-extrabold">{title}</Text>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: Boolean(option.selected) }}
              className={`mb-2 flex-row items-center rounded-2xl px-4 py-3.5 active:opacity-70 ${option.selected ? "bg-accent" : "bg-card"}`}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={option.destructive ? colors.danger : colors.primary}
              />
              <Text
                className={`ml-3 flex-1 text-[15px] font-bold ${option.destructive ? "text-destructive" : ""}`}
              >
                {option.label}
              </Text>
              {option.selected ? (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default OptionSheet;
