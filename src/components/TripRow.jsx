import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { formatShortDate } from "../utils/date";
import { useTranslation } from "../i18n/LanguageContext";
import TripImage from "./TripImage";

function TripRow({ trip, onPress }) {
  const { locale } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trip.title}, ${trip.location}`}
      className="mb-3 flex-row items-center rounded-3xl bg-card p-2.5 active:opacity-80"
    >
      <TripImage
        uri={trip.imageUrl}
        category={trip.category}
        className="mr-3 h-16 w-16 rounded-[20px]"
        iconSize={26}
      />
      <View className="flex-1">
        <Text className="text-[15px] font-bold" numberOfLines={1}>{trip.title}</Text>
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
          {trip.location}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={12} color={colors.primary} />
          <Text className="text-xs font-semibold text-primary">{formatShortDate(trip.visitDate, locale)}</Text>
        </View>
      </View>
      {trip.isFavorite ? (
        <Ionicons name="heart" size={18} color={colors.primary} style={{ marginRight: 8 }} />
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginRight: 4 }} />
    </Pressable>
  );
}

export default TripRow;
