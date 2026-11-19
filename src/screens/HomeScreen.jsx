import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";

import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import AppHeader from "../components/AppHeader";
import Avatar from "../components/Avatar";
import StateMessage from "../components/StateMessage";
import StatTile from "../components/StatTile";
import TripPhotoCard from "../components/TripPhotoCard";
import TripRow from "../components/TripRow";
import { colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useTrips } from "../hooks/useTrips";
import { todayDateOnly } from "../utils/date";
import { getCountryCount } from "../utils/tripStats";
import { useTranslation } from "../i18n/LanguageContext";

const RECENT_COUNT = 4;

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View className="mb-3 mt-2 flex-row items-center justify-between">
      <Text className="text-xl font-extrabold">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text className="text-sm font-bold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    trips,
    isLoading,
    isRefreshing,
    error,
    refresh,
    retry,
    toggleFavorite,
  } = useTrips();

  const fullName = user?.fullName.split(" ")[0] || t("home.traveler");
  const openTrip = (tripId) => navigation.navigate("TripDetails", { tripId });
  const openProfile = () => navigation.navigate("Profile");

  const today = todayDateOnly();
  const nextTrip = [...trips]
    .filter((trip) => trip.visitDate > today)
    .sort((a, b) => a.visitDate.localeCompare(b.visitDate))[0];
  const favorites = trips.filter((trip) => trip.isFavorite);
  const recentTrips = [...trips]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_COUNT);

  let content;
  if (isLoading) {
    content = <Spinner size="large" className="py-20" color={colors.primary} />;
  } else if (error) {
    content = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("home.loadError")}
        message={error}
        actionLabel={t("common.tryAgain")}
        onAction={retry}
      />
    );
  } else if (trips.length === 0) {
    content = (
      <StateMessage
        icon="paper-plane-outline"
        title={t("home.emptyTitle")}
        message={t("home.emptyMessage")}
        actionLabel={t("home.addFirstTrip")}
        onAction={() => navigation.navigate("AddTrip")}
      />
    );
  } else {
    content = (
      <>
        <View className="mb-5 flex-row gap-2.5">
          <StatTile
            icon="airplane"
            value={trips.length}
            label={t("stats.trips")}
            highlight
            onPress={() => navigation.navigate("Trips", { filter: "all" })}
          />
          <StatTile
            icon="flag"
            value={getCountryCount(trips)}
            label={t("stats.countries")}
            onPress={() => navigation.navigate("Countries")}
          />
          <StatTile
            icon="heart"
            value={favorites.length}
            label={t("stats.favorites")}
            onPress={() =>
              navigation.navigate("Trips", { filter: "favorites" })
            }
          />
        </View>

        {nextTrip ? (
          <>
            <SectionHeader title={t("home.upNext")} />
            <TripPhotoCard
              trip={nextTrip}
              onPress={() => openTrip(nextTrip.id)}
              onToggleFavorite={toggleFavorite}
            />
          </>
        ) : null}

        {favorites.length > 0 ? (
          <>
            <SectionHeader
              title={t("home.favorites")}
              actionLabel={t("common.seeAll")}
              onAction={() =>
                navigation.navigate("Trips", { filter: "favorites" })
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 mb-4"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              {favorites.map((trip) => (
                <TripPhotoCard
                  key={trip.id}
                  trip={trip}
                  compact
                  onPress={() => openTrip(trip.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader
          title={t("home.recentlyAdded")}
          actionLabel={t("home.allTrips")}
          onAction={() => navigation.navigate("Trips")}
        />
        {recentTrips.map((trip) => (
          <TripRow
            key={trip.id}
            trip={trip}
            onPress={() => openTrip(trip.id)}
          />
        ))}
      </>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        eyebrow={t("home.welcomeBack")}
        title={t("home.greeting", { name: fullName })}
        right={
          <Pressable
            onPress={openProfile}
            accessibilityRole="button"
            accessibilityLabel={t("home.openProfile")}
            className="flex-row items-center gap-1.5 rounded-full bg-card p-1 pr-2.5 active:opacity-80"
          >
            <Avatar
              uri={profile?.avatarUrl}
              name={user?.fullName}
              email={user?.email}
              size={40}
            />
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Text className="mb-5 text-[15px] leading-6 text-muted-foreground">
          {t("home.tagline")}
        </Text>
        {content}
      </ScrollView>
    </View>
  );
}

export default HomeScreen;
