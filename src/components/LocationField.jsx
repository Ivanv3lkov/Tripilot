import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { getCurrentPlace, searchPlaces } from "../services/placesService";
import FormTextInput from "./FormTextInput";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY_MS = 350;

// Text field with place suggestions (OpenStreetMap) and a "use my current
// location" button (device GPS). The value is a single "City, Country" string.
function LocationField({ value, onChange, error, disabled }) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [query, setQuery] = useState(null);

  // Search only for text the user typed, not for a picked suggestion.
  useEffect(() => {
    if (query === null || query.trim().length < MIN_QUERY_LENGTH) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlaces(query.trim(), controller.signal);
        setSuggestions(results);
        setSearchError(null);
      } catch (searchFailure) {
        if (searchFailure.name !== "AbortError") setSearchError(searchFailure);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleChangeText = (text) => {
    onChange(text);
    setQuery(text);
    if (text.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const pick = (label) => {
    onChange(label);
    setQuery(null);
    setSuggestions([]);
    setSearchError(null);
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    setSearchError(null);
    try {
      pick(await getCurrentPlace());
    } catch (locationError) {
      setSearchError(locationError);
    } finally {
      setIsLocating(false);
    }
  };

  const showSuggestions = query !== null && suggestions.length > 0;

  return (
    <View className="mb-1">
      <FormTextInput
        label={t("location.label")}
        icon="location-outline"
        value={value}
        onChangeText={handleChangeText}
        error={error}
        placeholder={t("location.placeholder")}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
        editable={!disabled}
      />

      {isSearching || showSuggestions ? (
        <View className="-mt-1.5 mb-3 overflow-hidden rounded-2xl border border-border bg-card">
          {isSearching && !showSuggestions ? (
            <View className="flex-row items-center gap-2 px-4 py-3">
              <Spinner size="small" color={colors.primary} />
              <Text className="text-sm text-muted-foreground">{t("location.searching")}</Text>
            </View>
          ) : null}
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion.id}
              onPress={() => pick(suggestion.label)}
              accessibilityRole="button"
              accessibilityLabel={suggestion.label}
              className={`flex-row items-center px-4 py-3 active:bg-secondary ${index > 0 ? "border-t border-border" : ""}`}
            >
              <Ionicons
                name={suggestion.isCountry ? "flag-outline" : "location-outline"}
                size={18}
                color={colors.primary}
              />
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold" numberOfLines={1}>{suggestion.label}</Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {suggestion.isCountry ? t("location.country") : suggestion.detail}
                </Text>
              </View>
            </Pressable>
          ))}
          <Text className="border-t border-border px-4 py-1.5 text-[10px] text-muted-foreground">
            {t("location.attribution")}
          </Text>
        </View>
      ) : null}

      {searchError ? (
        <Text className="mb-2 text-xs text-destructive">
          {getErrorMessage(t, searchError, "errors.searchFailed")}
        </Text>
      ) : null}

      <Pressable
        onPress={useCurrentLocation}
        disabled={disabled || isLocating}
        accessibilityRole="button"
        accessibilityLabel={t("location.useCurrent")}
        className="mb-3 flex-row items-center gap-2 self-start rounded-full bg-accent px-3.5 py-2 active:opacity-70"
      >
        {isLocating ? (
          <Spinner size="small" color={colors.primary} />
        ) : (
          <Ionicons name="navigate" size={15} color={colors.primary} />
        )}
        <Text className="text-[13px] font-bold text-primary">
          {isLocating ? t("location.locating") : t("location.useCurrent")}
        </Text>
      </Pressable>
    </View>
  );
}

export default LocationField;
