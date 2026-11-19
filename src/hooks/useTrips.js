import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { listTrips, setFavorite } from "../services/tripService";

// Loads the signed-in user's trips and reloads them each time the screen gains
// focus, so lists stay current after creating, editing, or deleting a trip.
export function useTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(async ({ refreshing = false } = {}) => {
    const currentRequest = ++requestId.current;
    if (refreshing) setIsRefreshing(true);
    try {
      const nextTrips = await listTrips();
      if (currentRequest !== requestId.current) return;
      setTrips(nextTrips);
      setError(null);
    } catch (loadError) {
      if (currentRequest !== requestId.current) return;
      setError(loadError);
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(() => load({ refreshing: true }), [load]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    load();
  }, [load]);

  // Optimistic update: the heart changes immediately and is reverted on error.
  const toggleFavorite = useCallback(async (trip) => {
    const nextValue = !trip.isFavorite;
    const apply = (value) =>
      setTrips((current) =>
        current.map((item) =>
          item.id === trip.id ? { ...item, isFavorite: value } : item,
        ),
      );
    apply(nextValue);
    try {
      await setFavorite(trip.id, nextValue);
    } catch (favoriteError) {
      apply(trip.isFavorite);
      Alert.alert(t("favorites.updateFailed"), getErrorMessage(t, favoriteError, "errors.generic"));
    }
  }, [t]);

  // The error is kept as an object and translated here, in the current language.
  const errorMessage = error ? getErrorMessage(t, error, "errors.loadTrips") : null;

  return { trips, isLoading, isRefreshing, error: errorMessage, refresh, retry, toggleFavorite };
}
