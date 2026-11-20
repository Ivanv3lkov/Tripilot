import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../../components/ui/text";
import { useTranslation } from "../i18n/LanguageContext";
import IconButton from "./IconButton";

// Header for screens opened on top of the tabs (forms, profile).
function StackHeader({ title, icon = "chevron-back", right }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center bg-background px-5 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <IconButton
        icon={icon}
        label={icon === "close" ? t("common.close") : t("common.back")}
        onPress={() => navigation.goBack()}
      />
      <Text className="mx-3 flex-1 text-center text-lg font-extrabold" numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View style={{ width: 42 }} />}
    </View>
  );
}

export default StackHeader;
