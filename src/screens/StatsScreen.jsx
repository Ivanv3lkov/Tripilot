import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, View } from "react-native";

import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import AppHeader from "../components/AppHeader";
import StateMessage from "../components/StateMessage";
import StatTile from "../components/StatTile";
import { colors } from "../constants/theme";
import { useTrips } from "../hooks/useTrips";
import { formatDate } from "../utils/date";
import { getMonthLabel, getTripStats } from "../utils/tripStats";
import { useTranslation } from "../i18n/LanguageContext";

const CHART_BAR_MAX_HEIGHT = 110;

function Panel({ title, children, dark = false }) {
  return (
    <View className={`mb-4 rounded-[28px] p-5 ${dark ? "bg-foreground" : "bg-card"}`}>
      <Text className={`mb-4 text-base font-extrabold ${dark ? "text-white" : ""}`}>{title}</Text>
      {children}
    </View>
  );
}

function Highlight({ icon, label, value, detail }) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-white/10 p-3">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary">
        <Ionicons name={icon} size={18} color={colors.white} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-white/60">{label}</Text>
        <Text className="text-[15px] font-bold text-white" numberOfLines={1}>{value}</Text>
      </View>
      {detail ? <Text className="ml-2 text-xs font-bold text-primary">{detail}</Text> : null}
    </View>
  );
}

function StatsContent({ stats, navigation }) {
  const { t, locale } = useTranslation();
  const maxMonthly = Math.max(1, ...stats.monthly.map((month) => month.count));
  const maxCountry = Math.max(1, ...stats.topCountries.map((country) => country.count));
  // Only the categories that have trips, most used first.
  const usedCategories = stats.categories
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(1, ...usedCategories.map((category) => category.count));
  const { topRated, nextTrip, firstTrip } = stats.highlights;

  return (
    <>
      <View className="mb-4 flex-row gap-2">
        <StatTile
          icon="airplane"
          value={stats.total}
          label={t("stats.trips")}
          highlight
          onPress={() => navigation.navigate("Trips", { filter: "all" })}
        />
        <StatTile
          icon="flag"
          value={stats.countries}
          label={t("stats.countries")}
          onPress={() => navigation.navigate("Countries")}
        />
        <StatTile
          icon="star"
          value={stats.averageRating !== null ? stats.averageRating.toFixed(1) : "–"}
          label={t("stats.rating")}
        />
        <StatTile
          icon="heart"
          value={stats.favorites}
          label={t("stats.favorites")}
          onPress={() => navigation.navigate("Trips", { filter: "favorites" })}
        />
      </View>

      <Panel title={t("stats.lastSixMonths")}>
        <View className="flex-row items-end justify-between" style={{ height: CHART_BAR_MAX_HEIGHT + 40 }}>
          {stats.monthly.map((month, index) => {
            const isCurrent = index === stats.monthly.length - 1;
            return (
              <View key={month.key} className="h-full flex-1 items-center justify-end">
                <Text className="mb-1 text-xs font-bold text-muted-foreground">{month.count}</Text>
                <View
                  className={`w-7 rounded-full ${isCurrent ? "bg-primary" : "bg-accent"}`}
                  style={{ height: Math.max(8, (month.count / maxMonthly) * CHART_BAR_MAX_HEIGHT) }}
                />
                <Text className={`mt-1.5 text-xs font-semibold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                  {month.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Panel>

      <Panel title={t("stats.topCountries")}>
        {stats.topCountries.map((country, index) => (
          <View key={country.name} className="mb-3 flex-row items-center">
            <Text className="w-6 text-sm font-extrabold text-primary">{index + 1}</Text>
            <View className="flex-1">
              <View className="mb-1 flex-row justify-between">
                <Text className="text-sm font-bold">{country.name}</Text>
                <Text className="text-xs font-semibold text-muted-foreground">
                  {t("common.tripCount", { count: country.count })}
                </Text>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(country.count / maxCountry) * 100}%` }}
                />
              </View>
            </View>
          </View>
        ))}
      </Panel>

      <Panel title={t("stats.tripMoods")}>
        {usedCategories.map((category) => (
          <View key={category.value} className="mb-3 flex-row items-center">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-accent">
              <Ionicons name={category.icon} size={16} color={colors.primary} />
            </View>
            <Text className="w-[100px] text-sm font-bold" numberOfLines={1}>{t(`categories.${category.value}`)}</Text>
            <View className="mx-2 h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <View
                className="h-full rounded-full"
                style={{ width: `${(category.count / maxCategory) * 100}%`, backgroundColor: colors.star }}
              />
            </View>
            <Text className="w-6 text-right text-sm font-extrabold">{category.count}</Text>
          </View>
        ))}
      </Panel>

      <Panel title={t("stats.highlights")} dark>
        <Highlight
          icon="trophy"
          label={t("stats.topRated")}
          value={topRated ? topRated.title : t("stats.noRated")}
          detail={topRated ? `${topRated.rating}.0 ★` : null}
        />
        <Highlight
          icon="calendar"
          label={t("stats.nextTrip")}
          value={nextTrip ? nextTrip.title : t("stats.nothingPlanned")}
          detail={nextTrip ? formatDate(nextTrip.visitDate, locale) : null}
        />
        <Highlight
          icon="flag"
          label={t("stats.firstTrip")}
          value={firstTrip.title}
          detail={getMonthLabel(firstTrip.visitDate, locale)}
        />
      </Panel>
    </>
  );
}

function StatsScreen({ navigation }) {
  const { t, locale } = useTranslation();
  const { trips, isLoading, isRefreshing, error, refresh, retry } = useTrips();

  let content;
  if (isLoading) {
    content = <Spinner size="large" className="py-20" color={colors.primary} />;
  } else if (error) {
    content = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("stats.loadError")}
        message={error}
        actionLabel={t("common.tryAgain")}
        onAction={retry}
      />
    );
  } else if (trips.length === 0) {
    content = (
      <StateMessage
        icon="pie-chart-outline"
        title={t("stats.emptyTitle")}
        message={t("stats.emptyMessage")}
        actionLabel={t("stats.addTrip")}
        onAction={() => navigation.navigate("AddTrip")}
      />
    );
  } else {
    content = <StatsContent stats={getTripStats(trips, locale)} navigation={navigation} />;
  }

  return (
    <View className="flex-1 bg-background">
      <AppHeader eyebrow={t("stats.eyebrow")} title={t("stats.title")} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 24 }}
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
        {content}
      </ScrollView>
    </View>
  );
}

export default StatsScreen;
