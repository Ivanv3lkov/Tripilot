import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, View } from "react-native";

import { Input, InputField, InputSlot } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import AppHeader from "../components/AppHeader";
import Chip from "../components/Chip";
import IconButton from "../components/IconButton";
import OptionSheet from "../components/OptionSheet";
import StateMessage from "../components/StateMessage";
import TripPhotoCard from "../components/TripPhotoCard";
import { colors } from "../constants/theme";
import { CATEGORIES } from "../constants/trips";
import { useTrips } from "../hooks/useTrips";
import { getCountry } from "../utils/tripStats";
import { useTranslation } from "../i18n/LanguageContext";
import { SORT_OPTIONS, getSortLabelKey, sortTrips } from "../utils/tripSort";

const FILTERS = [
  { value: "all", labelKey: "trips.filterAll", icon: "apps-outline" },
  { value: "favorites", labelKey: "trips.filterFavorites", icon: "heart-outline" },
  ...CATEGORIES.map((category) => ({ ...category, labelKey: `categories.${category.value}` })),
];

function matchesFilter(trip, filter) {
  if (filter === "all") return true;
  if (filter === "favorites") return trip.isFavorite;
  return trip.category === filter;
}

function matchesCountry(trip, country) {
  return !country || getCountry(trip.location).toLowerCase() === country.toLowerCase();
}

function matchesSearch(trip, search) {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return (
    trip.title.toLowerCase().includes(query) ||
    trip.location.toLowerCase().includes(query)
  );
}

function TripsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { trips, isLoading, isRefreshing, error, refresh, retry, toggleFavorite } = useTrips();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [country, setCountry] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Home tiles and the Countries screen open this tab with { filter } or
  // { country }. The params are applied once and then cleared.
  const requestedFilter = route.params?.filter;
  const requestedCountry = route.params?.country;
  useFocusEffect(
    useCallback(() => {
      if (!requestedFilter && !requestedCountry) return;
      setFilter(requestedFilter ?? "all");
      setCountry(requestedCountry ?? null);
      setSearch("");
      navigation.setParams({ filter: undefined, country: undefined });
    }, [requestedFilter, requestedCountry, navigation]),
  );

  const visibleTrips = sortTrips(
    trips.filter(
      (trip) =>
        matchesFilter(trip, filter) &&
        matchesCountry(trip, country) &&
        matchesSearch(trip, search),
    ),
    sortBy,
  );

  let emptyContent;
  if (isLoading) {
    emptyContent = <Spinner size="large" className="py-16" color={colors.primary} />;
  } else if (error) {
    emptyContent = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("trips.loadError")}
        message={error}
        actionLabel={t("common.tryAgain")}
        onAction={retry}
      />
    );
  } else if (trips.length === 0) {
    emptyContent = (
      <StateMessage
        icon="images-outline"
        title={t("trips.emptyTitle")}
        message={t("trips.emptyMessage")}
      />
    );
  } else if (filter === "favorites" && !search.trim()) {
    emptyContent = (
      <StateMessage
        icon="heart-outline"
        title={t("trips.noFavoritesTitle")}
        message={t("trips.noFavoritesMessage")}
      />
    );
  } else {
    emptyContent = (
      <StateMessage
        icon="search-outline"
        title={t("trips.nothingFoundTitle")}
        message={t("trips.nothingFoundMessage")}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        eyebrow={isLoading ? t("common.loading") : t("trips.savedCount", { count: trips.length })}
        title={t("trips.title")}
        right={<IconButton icon="swap-vertical" label={t("sort.title")} onPress={() => setIsSortOpen(true)} />}
      />

      <FlatList
        data={error ? [] : visibleTrips}
        keyExtractor={(trip) => trip.id}
        renderItem={({ item }) => (
          <TripPhotoCard
            trip={item}
            onPress={() => navigation.navigate("TripDetails", { tripId: item.id })}
            onToggleFavorite={toggleFavorite}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View className="mb-3">
            <Input className="min-h-12 rounded-full border-0 bg-card px-4">
              <InputSlot>
                <Ionicons name="search" size={18} color={colors.primary} />
              </InputSlot>
              <InputField
                className="text-base"
                value={search}
                onChangeText={setSearch}
                placeholder={t("trips.searchPlaceholder")}
                accessibilityLabel={t("trips.search")}
                autoCorrect={false}
                returnKeyType="search"
              />
            </Input>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 mt-3"
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {FILTERS.map((item) => (
                <Chip
                  key={item.value}
                  label={t(item.labelKey)}
                  icon={item.icon}
                  active={filter === item.value}
                  onPress={() => setFilter(item.value)}
                />
              ))}
            </ScrollView>
            {country ? (
              <Pressable
                onPress={() => setCountry(null)}
                accessibilityRole="button"
                accessibilityLabel={t("trips.removeCountryFilter", { country })}
                className="mb-2 flex-row items-center gap-1.5 self-start rounded-full bg-primary px-3.5 py-2"
              >
                <Ionicons name="flag" size={13} color={colors.white} />
                <Text className="text-[13px] font-bold text-white">{country}</Text>
                <Ionicons name="close-circle" size={16} color={colors.white} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => setIsSortOpen(true)}
              accessibilityRole="button"
              className="mt-1 flex-row items-center gap-1 self-start"
              hitSlop={6}
            >
              <Text className="text-xs font-semibold text-muted-foreground">{t("sort.sortedBy")}</Text>
              <Text className="text-xs font-bold text-primary">{t(getSortLabelKey(sortBy))}</Text>
              <Ionicons name="chevron-down" size={12} color={colors.primary} />
            </Pressable>
          </View>
        }
        ListEmptyComponent={emptyContent}
      />

      <OptionSheet
        visible={isSortOpen}
        title={t("sort.title")}
        options={SORT_OPTIONS.map((option) => ({
          ...option,
          label: t(option.labelKey),
          selected: option.value === sortBy,
        }))}
        onSelect={(value) => {
          setSortBy(value);
          setIsSortOpen(false);
        }}
        onClose={() => setIsSortOpen(false)}
      />
    </View>
  );
}

export default TripsScreen;
