import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";
import TripImage from "./TripImage";

function AttractionCard({ attraction, index, onPress }) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={attraction.name}
      className="mb-2.5 flex-row items-center rounded-3xl bg-card p-2.5 active:opacity-80"
    >
      <View>
        <TripImage
          uri={attraction.photos[0]?.uri}
          category="History"
          className="h-16 w-16 rounded-[20px]"
          iconSize={24}
        />
        {attraction.photos.length > 1 ? (
          <View className="absolute -bottom-1 -right-1 flex-row items-center gap-0.5 rounded-full border-2 border-card bg-foreground px-1.5 py-0.5">
            <Ionicons name="images" size={9} color={colors.white} />
            <Text className="text-[10px] font-extrabold text-white">{attraction.photos.length}</Text>
          </View>
        ) : null}
        <View className="absolute -left-1 -top-1 h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary">
          <Text className="text-[11px] font-extrabold text-white">{index + 1}</Text>
        </View>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-bold" numberOfLines={1}>{attraction.name}</Text>
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={2}>
          {attraction.description || t("attraction.noNotes")}
        </Text>
        <Text className="mt-1 text-[11px] font-semibold text-primary">
          {attraction.photos.length > 0
            ? t("multiPhoto.count", { count: attraction.photos.length })
            : t("multiPhoto.noPhotos")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginRight: 4 }} />
    </Pressable>
  );
}

export default AttractionCard;
