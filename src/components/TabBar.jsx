import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";

const ICONS = {
  Home: "home",
  Trips: "map",
  Stats: "stats-chart",
  Profile: "person-circle",
};

function TabButton({ icon, label, focused, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      className="flex-1 items-center justify-center pt-2"
    >
      <View
        className={`h-8 w-14 items-center justify-center rounded-full ${focused ? "bg-accent" : ""}`}
      >
        <Ionicons
          name={focused ? icon : `${icon}-outline`}
          size={22}
          color={focused ? colors.primary : colors.textMuted}
        />
      </View>
      <Text
        className={`mt-1 text-[11px] ${focused ? "font-extrabold text-primary" : "font-semibold text-muted-foreground"}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Bottom tab bar: four tabs with icons and labels, and a raised "New trip"
// button in the middle that opens the Add Trip screen.
function TabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const tabs = state.routes.map((route, index) => {
    const focused = state.index === index;
    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <TabButton
        key={route.key}
        icon={ICONS[route.name] ?? "ellipse"}
        label={descriptors[route.key].options.title ?? route.name}
        focused={focused}
        onPress={onPress}
      />
    );
  });
  const middle = Math.ceil(tabs.length / 2);
  const openNewTrip = () => navigation.navigate("AddTrip");

  // The raised "+" must stay inside its parent's bounds: Android does not send
  // touches to the part of a view that sticks out of its parent. So the wrapper
  // is taller than the white bar and contains the whole circle.
  return (
    <View className="bg-background">
      <View
        className="mt-5 flex-row border-t border-border bg-card px-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        {tabs.slice(0, middle)}
        <Pressable
          onPress={openNewTrip}
          accessibilityRole="button"
          accessibilityLabel={t("tabs.newTrip")}
          // Wider than the other tabs so "Ново пътуване" fits on one line.
          className="items-center justify-end px-1 pt-2"
          style={{ flex: 1.5 }}
        >
          <View className="h-8" />
          <Text
            className="mt-1 text-[11px] font-extrabold text-primary"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {t("tabs.newTrip")}
          </Text>
        </Pressable>
        {tabs.slice(middle)}
      </View>

      <View pointerEvents="box-none" className="absolute left-0 right-0 top-0 items-center">
        <Pressable
          onPress={openNewTrip}
          accessibilityRole="button"
          accessibilityLabel={t("tabs.newTrip")}
          hitSlop={8}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-85"
          style={{ borderWidth: 4, borderColor: colors.background }}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

export default TabBar;
