import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors, photoScrim, softShadow } from "../constants/theme";
import { formatDate, isUpcoming } from "../utils/date";
import { useTranslation } from "../i18n/LanguageContext";
import HeartButton from "./HeartButton";
import TripImage from "./TripImage";

// Photo-first trip card with the text on a dark fade. `compact` is used in
// the horizontal favorites carousel.
function TripPhotoCard({ trip, onPress, onToggleFavorite, compact = false }) {
  const { t, locale } = useTranslation();
  const upcoming = isUpcoming(trip.visitDate);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trip.title}, ${trip.location}`}
      className={`overflow-hidden rounded-[28px] bg-card active:opacity-90 ${compact ? "mr-3.5 h-52 w-44" : "mb-4 h-64"}`}
      style={softShadow}
    >
      <TripImage
        uri={trip.imageUrl}
        category={trip.category}
        className="h-full w-full"
        iconSize={compact ? 44 : 64}
      />
      <LinearGradient
        colors={photoScrim}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "65%" }}
      />

      <View className="absolute left-3.5 right-3.5 top-3.5 flex-row items-start justify-between">
        <View className="flex-row gap-1.5">
          {!compact ? (
            <View className="rounded-full bg-white/90 px-3 py-1">
              <Text className="text-xs font-bold text-primary">{t(`categories.${trip.category}`)}</Text>
            </View>
          ) : null}
          {upcoming ? (
            <View className="rounded-full bg-primary px-3 py-1">
              <Text className="text-xs font-bold text-white">{t("trip.upcoming")}</Text>
            </View>
          ) : null}
        </View>
        {onToggleFavorite ? (
          <HeartButton
            active={trip.isFavorite}
            onPress={() => onToggleFavorite(trip)}
            size={compact ? 32 : 38}
          />
        ) : null}
      </View>

      <View className="absolute bottom-0 left-0 right-0 p-4">
        <Text
          className={`font-extrabold text-white ${compact ? "text-base" : "text-[22px] leading-7"}`}
          numberOfLines={compact ? 2 : 1}
        >
          {trip.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons name="location" size={12} color={colors.white} />
          <Text className="flex-1 text-xs font-semibold text-white/85" numberOfLines={1}>
            {trip.location}
          </Text>
        </View>
        {!compact ? (
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-white/75">{formatDate(trip.visitDate, locale)}</Text>
            {trip.rating > 0 ? (
              <View className="flex-row items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <Ionicons name="star" size={12} color={colors.star} />
                <Text className="text-xs font-bold text-white">{trip.rating}.0</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default TripPhotoCard;
