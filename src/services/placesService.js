import * as Location from "expo-location";

import { ApiError } from "./apiError";

// Photon is a free OpenStreetMap search API (no key). It is used only for
// place-name suggestions while the user types; the caller aborts stale requests.
const PHOTON_URL = "https://photon.komoot.io/api/";

export function formatPlace(city, country) {
  return [city, country].filter(Boolean).join(", ");
}

function toSuggestion(feature) {
  const { name, country, state, countrycode, type, osm_id: osmId } = feature.properties;
  const isCountry = type === "country";
  return {
    id: `${osmId}-${type}`,
    label: isCountry ? country : formatPlace(name, country),
    detail: isCountry ? null : [state, country].filter(Boolean).join(", "),
    isCountry,
    countryCode: countrycode ?? null,
  };
}

export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({ q: query, limit: "6", lang: "en" });
  params.append("layer", "city");
  params.append("layer", "country");

  let response;
  try {
    response = await fetch(`${PHOTON_URL}?${params}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Could not load suggestions. Check your internet.", {
      code: "network_error",
      cause: error,
    });
  }
  if (!response.ok) {
    throw new ApiError("Place search is not available right now.", {
      status: response.status,
      code: "search_failed",
    });
  }
  const data = await response.json();
  const seen = new Set();
  return data.features
    .filter((feature) => feature.properties?.country)
    .map(toSuggestion)
    .filter((suggestion) => {
      if (seen.has(suggestion.label)) return false;
      seen.add(suggestion.label);
      return true;
    });
}

// Uses the device location and the platform geocoder to get "City, Country".
export async function getCurrentPlace() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new ApiError("Allow location access in your device settings to use your current location.", {
      code: "location_denied",
    });
  }

  let position;
  try {
    position =
      (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  } catch {
    throw new ApiError("Could not get your location. Make sure location services are on.", {
      code: "location_unavailable",
    });
  }

  const [address] = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
  const city = address?.city ?? address?.subregion ?? address?.region;
  if (!address?.country) {
    throw new ApiError("Could not find a place name for your location.", {
      code: "location_unknown",
    });
  }
  return formatPlace(city, address.country);
}
