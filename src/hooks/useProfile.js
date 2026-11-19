import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { getProfile } from "../services/profileService";

// Loads the profile row (avatar, member since) on focus, so the avatar in the
// Home header updates after it is changed on the Profile screen.
export function useProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setProfile(await getProfile(userId));
      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    load();
  }, [load]);

  const errorMessage = error ? getErrorMessage(t, error, "errors.loadProfile") : null;

  return { profile, setProfile, isLoading, error: errorMessage, retry };
}
