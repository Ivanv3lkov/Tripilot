import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import AttractionCard from "../components/AttractionCard";
import HeartButton from "../components/HeartButton";
import IconButton from "../components/IconButton";
import StackHeader from "../components/StackHeader";
import StateMessage from "../components/StateMessage";
import FitImage from "../components/FitImage";
import { colors } from "../constants/theme";
import { getCategoryIcon } from "../constants/trips";
import { listAttractions } from "../services/attractionService";
import { deleteTrip, getTrip, setFavorite } from "../services/tripService";
import { formatDate, isUpcoming } from "../utils/date";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";

function Fact({ icon, label, value }) {
  return (
    <View className="flex-1 items-center rounded-3xl bg-secondary px-2 py-3.5">
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-0.5 text-center text-sm font-extrabold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function TripDetailsScreen({ navigation, route }) {
  const { t, locale } = useTranslation();
  const { tripId } = route.params;
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attractions, setAttractions] = useState([]);
  const [attractionsError, setAttractionsError] = useState(null);

  const loadAttractions = useCallback(async () => {
    try {
      setAttractions(await listAttractions(tripId));
      setAttractionsError(null);
    } catch (loadError) {
      setAttractionsError(loadError);
    }
  }, [tripId]);

  const load = useCallback(async () => {
    try {
      const [loadedTrip] = await Promise.all([getTrip(tripId), loadAttractions()]);
      setTrip(loadedTrip);
      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, loadAttractions]);

  // Reload on focus so changes made in Edit Trip are shown. The photo is
  // behind the status bar, so use light icons while this screen is focused.
  useFocusEffect(
    useCallback(() => {
      load();
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [load]),
  );

  const retry = () => {
    setIsLoading(true);
    setError(null);
    load();
  };

  const toggleFavorite = async () => {
    const previous = trip;
    setTrip({ ...trip, isFavorite: !trip.isFavorite });
    try {
      setTrip(await setFavorite(trip.id, !previous.isFavorite));
    } catch (favoriteError) {
      setTrip(previous);
      Alert.alert(t("favorites.updateFailed"), getErrorMessage(t, favoriteError, "errors.generic"));
    }
  };

  const runDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrip(trip);
      navigation.goBack();
    } catch (deleteError) {
      setIsDeleting(false);
      Alert.alert(t("tripDetails.deleteFailed"), getErrorMessage(t, deleteError, "errors.generic"));
    }
  };

  const confirmDelete = () => {
    Alert.alert(t("tripDetails.deleteTitle"), t("common.deleteMessage", { name: trip.title }), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: runDelete },
    ]);
  };

  if (isLoading || (error && !trip)) {
    const isMissing = error?.code === "not_found";
    return (
      <View className="flex-1 bg-background">
        <StackHeader title={t("tripDetails.title")} />
        {isLoading ? (
          <Spinner size="large" className="py-20" color={colors.primary} />
        ) : (
          <StateMessage
            tone="error"
            icon={isMissing ? "trash-outline" : "cloud-offline-outline"}
            title={isMissing ? t("tripDetails.notFound") : t("tripDetails.loadError")}
            message={getErrorMessage(t, error, "errors.loadTrip")}
            actionLabel={isMissing ? t("common.back") : t("common.tryAgain")}
            onAction={isMissing ? () => navigation.goBack() : retry}
          />
        )}
      </View>
    );
  }

  const upcoming = isUpcoming(trip.visitDate);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* The whole cover photo in its own proportions, without cropping. */}
        <View>
          <FitImage
            uri={trip.imageUrl}
            category={trip.category}
            fallbackHeight={260 + insets.top}
          />
          <LinearGradient
            colors={["rgba(31, 36, 22, 0.5)", "transparent"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: 140 }}
          />
          <View
            className="absolute left-5 right-5 flex-row items-center justify-between"
            style={{ top: insets.top + 8 }}
          >
            <IconButton icon="chevron-back" label="Go back" variant="glass" onPress={() => navigation.goBack()} />
            <View className="flex-row gap-2.5">
              <HeartButton active={trip.isFavorite} onPress={toggleFavorite} size={42} />
            </View>
          </View>
        </View>

        <View className="bg-background px-5 pt-5">
          <View className="mb-2 flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-accent px-3 py-1.5">
              <Ionicons name={getCategoryIcon(trip.category)} size={13} color={colors.primary} />
              <Text className="text-xs font-bold text-primary">{t(`categories.${trip.category}`)}</Text>
            </View>
            <View className={`rounded-full px-3 py-1.5 ${upcoming ? "bg-primary" : "bg-secondary"}`}>
              <Text className={`text-xs font-bold ${upcoming ? "text-white" : "text-muted-foreground"}`}>
                {upcoming ? t("trip.upcoming") : t("trip.visited")}
              </Text>
            </View>
          </View>

          <Text className="text-[30px] font-extrabold leading-9">{trip.title}</Text>
          <View className="mt-1.5 flex-row items-center gap-1">
            <Ionicons name="location" size={15} color={colors.primary} />
            <Text className="text-[15px] font-semibold text-muted-foreground">{trip.location}</Text>
          </View>

          <View className="my-5 flex-row gap-2.5">
            <Fact
              icon="calendar"
              label={upcoming ? t("trip.planned") : t("trip.visited")}
              value={formatDate(trip.visitDate, locale)}
            />
            <Fact
              icon="star"
              label={t("stats.rating")}
              value={trip.rating > 0 ? `${trip.rating} / 5` : t("trip.notRated")}
            />
            <Fact icon="flag" label={t("tripDetails.places")} value={String(attractions.length)} />
          </View>

          <Text className="mb-2 text-lg font-extrabold">{t("tripDetails.story")}</Text>
          <Text className="mb-6 text-[15px] leading-6 text-muted-foreground">
            {trip.description || t("tripDetails.noStory")}
          </Text>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-extrabold">{t("tripDetails.attractions")}</Text>
            <Pressable
              onPress={() => navigation.navigate("AddAttraction", { tripId: trip.id })}
              accessibilityRole="button"
              accessibilityLabel={t("attraction.add")}
              className="flex-row items-center gap-1 rounded-full bg-accent px-3.5 py-2 active:opacity-70"
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text className="text-[13px] font-extrabold text-primary">{t("common.add")}</Text>
            </Pressable>
          </View>

          {attractionsError ? (
            <Pressable onPress={loadAttractions} accessibilityRole="button" className="mb-3">
              <Text className="text-sm text-destructive">
                {getErrorMessage(t, attractionsError, "errors.loadAttractions")}{" "}
                <Text className="font-bold text-primary">{t("common.tryAgain")}</Text>
              </Text>
            </Pressable>
          ) : null}

          {attractions.length > 0 ? (
            attractions.map((attraction, index) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                index={index}
                onPress={() =>
                  navigation.navigate("AttractionDetails", { attractionId: attraction.id })
                }
              />
            ))
          ) : !attractionsError ? (
            <Pressable
              onPress={() => navigation.navigate("AddAttraction", { tripId: trip.id })}
              accessibilityRole="button"
              className="items-center rounded-3xl border border-dashed border-primary/40 bg-card px-5 py-6 active:opacity-80"
            >
              <Ionicons name="flag-outline" size={28} color={colors.primary} />
              <Text className="mt-2 text-[15px] font-bold">{t("tripDetails.noAttractions")}</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground">
                {t("tripDetails.noAttractionsHint")}
              </Text>
            </Pressable>
          ) : null}

          {/* Trip actions at the end of the page. */}
          <View className="mt-6 flex-row gap-2.5">
            <Button
              className="h-14 flex-1 rounded-full"
              onPress={() => navigation.navigate("EditTrip", { tripId: trip.id })}
              isDisabled={isDeleting}
            >
              <Ionicons name="pencil" size={18} color={colors.white} />
              <ButtonText className="text-base font-extrabold">{t("common.edit")}</ButtonText>
            </Button>
            <Button
              variant="outline"
              className="h-14 flex-1 rounded-full border-destructive/40 bg-transparent"
              onPress={confirmDelete}
              isDisabled={isDeleting}
              accessibilityLabel={t("tripDetails.delete")}
            >
              {isDeleting ? (
                <Spinner color={colors.danger} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              )}
              <ButtonText className="text-base font-extrabold text-destructive">
                {t("common.delete")}
              </ButtonText>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default TripDetailsScreen;
