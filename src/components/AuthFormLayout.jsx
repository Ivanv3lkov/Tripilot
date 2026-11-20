import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../../components/ui/text";
import { colors, softShadow } from "../constants/theme";
import LanguageSwitch from "./LanguageSwitch";

// Compact layout so the whole Register form fits on a phone screen without
// scrolling. Scrolling still works when the keyboard is open.
function AuthFormLayout({ title, subtitle, children, keyboardOffset = 24 }) {
  const insets = useSafeAreaInsets();

  // keyboardOffset is the space kept between the focused input and the keyboard,
  // so the action buttons below the last input stay visible.
  return (
    <View className="flex-1 overflow-hidden bg-background">
      <View
        className="absolute rounded-full bg-primary"
        style={{ width: 280, height: 280, top: -150, right: -90 }}
      />
      <View
        className="absolute rounded-full bg-accent"
        style={{ width: 160, height: 160, top: 40, right: -70 }}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={keyboardOffset}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row items-center gap-2.5">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
            style={{ transform: [{ rotate: "-8deg" }] }}
          >
            <Ionicons name="paper-plane" size={22} color={colors.white} />
          </View>
          <Text className="flex-1 text-[22px] font-extrabold">Tripilot</Text>
          <LanguageSwitch />
        </View>

        <Text className="text-[30px] font-extrabold leading-9">{title}</Text>
        {subtitle ? (
          <Text className="mb-4 mt-1 text-sm text-muted-foreground">{subtitle}</Text>
        ) : null}

        <View className="rounded-[28px] bg-card p-5" style={softShadow}>
          {children}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export default AuthFormLayout;
