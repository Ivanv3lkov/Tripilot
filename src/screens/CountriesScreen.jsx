import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import StackHeader from "../components/StackHeader";
import StateMessage from "../components/StateMessage";
import { colors } from "../constants/theme";
import { useTrips } from "../hooks/useTrips";
import { getCountries } from "../utils/tripStats";
import { useTranslation } from "../i18n/LanguageContext";

function CountriesScreen({ navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trips, isLoading, isRefreshing, error, refresh, retry } = useTrips();
  const countries = getCountries(trips);
  const maxCount = Math.max(1, ...countries.map((country) => country.count));

  // Go back to the tabs and show the Trips tab filtered by this country.
  const openCountry = (name) =>
    navigation.popTo("Tabs", { screen: "Trips", params: { country: name } });

  let emptyContent;
  if (isLoading) {
    emptyContent = <Spinner size="large" className="py-16" color={colors.primary} />;
  } else if (error) {
    emptyContent = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("countries.loadError")}
        message={error}
        actionLabel={t("common.tryAgain")}
        onAction={retry}
      />
    );
  } else {
    emptyContent = (
      <StateMessage
        icon="earth-outline"
        title={t("countries.emptyTitle")}
        message={t("countries.emptyMessage")}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("countries.title")} />
      <FlatList
        data={error ? [] : countries}
        keyExtractor={(country) => country.name}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 24 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          !isLoading && !error && countries.length > 0 ? (
            <Text className="mb-3 text-sm text-muted-foreground">
              {t("countries.summary", { count: countries.length })}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => openCountry(item.name)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${t("common.tripCount", { count: item.count })}`}
            className="mb-2.5 flex-row items-center rounded-3xl bg-card p-3.5 active:opacity-80"
          >
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-accent">
              <Text className="text-sm font-extrabold text-primary">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="text-base font-bold" numberOfLines={1}>{item.name}</Text>
                <Text className="text-xs font-semibold text-muted-foreground">
                  {t("common.tripCount", { count: item.count })}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-secondary">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 10 }} />
          </Pressable>
        )}
        ListEmptyComponent={emptyContent}
      />
    </View>
  );
}

export default CountriesScreen;
