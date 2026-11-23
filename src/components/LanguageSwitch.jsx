import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { LANGUAGES, useTranslation } from "../i18n/LanguageContext";

// EN | BG segmented switch. The choice is saved on the device.
function LanguageSwitch({ className = "" }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <View
      className={`flex-row rounded-full bg-card p-1 ${className}`}
      accessibilityRole="radiogroup"
      accessibilityLabel={t("language.title")}
    >
      {LANGUAGES.map((option) => {
        const isActive = option.value === language;
        return (
          <Pressable
            key={option.value}
            onPress={() => setLanguage(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.name}
            className={`rounded-full px-3.5 py-1.5 ${isActive ? "bg-primary" : ""}`}
          >
            <Text className={`text-xs font-extrabold ${isActive ? "text-white" : "text-muted-foreground"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default LanguageSwitch;
