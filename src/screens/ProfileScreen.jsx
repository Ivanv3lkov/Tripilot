import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import AppHeader from "../components/AppHeader";
import Avatar from "../components/Avatar";
import CameraCapture from "../components/CameraCapture";
import OptionSheet from "../components/OptionSheet";
import StatTile from "../components/StatTile";
import { colors, softShadow } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useTrips } from "../hooks/useTrips";
import { removeAvatar, updateAvatar } from "../services/profileService";
import { pickFromGallery } from "../utils/pickImage";
import { getCountryCount } from "../utils/tripStats";
import LanguageSwitch from "../components/LanguageSwitch";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";

const AVATAR_SIZE = 116;

function InfoRow({ icon, label, value, isLast = false }) {
  return (
    <View className={`flex-row items-center py-3.5 ${isLast ? "" : "border-b border-border"}`}>
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-accent">
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-muted-foreground">{label}</Text>
        <Text className="mt-0.5 text-[15px] font-bold" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function formatMemberSince(timestamp, locale) {
  if (!timestamp) return "–";
  return new Date(timestamp).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function ProfileScreen({ navigation }) {
  const { t, locale } = useTranslation();
  const { user, signOut } = useAuth();
  const { profile, setProfile, isLoading, error, retry } = useProfile();
  const { trips, isLoading: tripsLoading } = useTrips();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const saveAvatar = async (photo) => {
    setIsSavingAvatar(true);
    try {
      setProfile(photo ? await updateAvatar(profile, photo) : await removeAvatar(profile));
    } catch (avatarError) {
      Alert.alert(t("profile.photoFailed"), getErrorMessage(t, avatarError, "errors.generic"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleAvatarOption = async (action) => {
    setIsSheetOpen(false);
    // iOS cannot present the camera or gallery while the sheet is still closing.
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (action === "camera") {
      setIsCameraOpen(true);
    } else if (action === "gallery") {
      const photo = await pickFromGallery({ crop: [1, 1], t });
      if (photo) await saveAvatar(photo);
    } else {
      await saveAvatar(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (logoutError) {
      Alert.alert(t("profile.logoutFailed"), getErrorMessage(t, logoutError, "errors.generic"));
      setIsLoggingOut(false);
    }
  };

  const avatarOptions = [
    { value: "camera", label: t("profile.takePhoto"), icon: "camera-outline" },
    { value: "gallery", label: t("profile.chooseGallery"), icon: "images-outline" },
    ...(profile?.avatarUrl
      ? [{ value: "remove", label: t("profile.removePhoto"), icon: "trash-outline", destructive: true }]
      : []),
  ];

  const statValue = (value) => (tripsLoading ? "–" : value);

  return (
    <View className="flex-1 bg-background">
      <AppHeader eyebrow={t("profile.eyebrow")} title={t("profile.title")} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 items-center rounded-[32px] bg-card px-5 pb-6 pt-7" style={softShadow}>
          <Pressable
            onPress={() => setIsSheetOpen(true)}
            disabled={!profile || isSavingAvatar}
            accessibilityRole="button"
            accessibilityLabel={t("profile.changePhoto")}
          >
            <View className="rounded-full border-4 border-accent">
              <Avatar
                uri={profile?.avatarUrl}
                name={user?.fullName}
                email={user?.email}
                size={AVATAR_SIZE}
              />
              {isSavingAvatar ? (
                <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
                  <Spinner color={colors.white} />
                </View>
              ) : null}
            </View>
            <View
              className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-foreground"
              style={{ borderWidth: 3, borderColor: colors.surface }}
            >
              <Ionicons name="camera" size={15} color={colors.white} />
            </View>
          </Pressable>

          <Text className="mt-4 text-2xl font-extrabold" numberOfLines={1}>
            {user?.fullName || t("profile.traveler")}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
            {user?.email}
          </Text>
          <Text className="mt-2 text-xs font-semibold text-primary">
            {profile?.avatarUrl ? t("profile.tapToChange") : t("profile.addPhotoHint")}
          </Text>
        </View>

        <View className="mb-5 flex-row gap-2.5">
          <StatTile
            icon="airplane"
            value={statValue(trips.length)}
            label={t("stats.trips")}
            highlight
            onPress={() => navigation.navigate("Trips", { filter: "all" })}
          />
          <StatTile
            icon="flag"
            value={statValue(getCountryCount(trips))}
            label={t("stats.countries")}
            onPress={() => navigation.navigate("Countries")}
          />
          <StatTile
            icon="heart"
            value={statValue(trips.filter((trip) => trip.isFavorite).length)}
            label={t("stats.favorites")}
            onPress={() => navigation.navigate("Trips", { filter: "favorites" })}
          />
        </View>

        <View className="mb-6 rounded-[28px] bg-card px-4">
          <InfoRow icon="person-outline" label={t("profile.fullName")} value={user?.fullName || t("profile.notSet")} />
          <InfoRow icon="mail-outline" label={t("auth.email")} value={user?.email ?? "–"} />
          {isLoading ? (
            <View className="items-center py-4">
              <Spinner color={colors.primary} />
            </View>
          ) : error ? (
            <Pressable onPress={retry} accessibilityRole="button" className="py-4">
              <Text className="text-sm text-destructive">
                {error} <Text className="font-bold text-primary">{t("common.tryAgain")}</Text>
              </Text>
            </Pressable>
          ) : (
            <InfoRow
              icon="calendar-outline"
              label={t("profile.memberSince")}
              value={formatMemberSince(profile?.createdAt, locale)}
              isLast
            />
          )}
        </View>

        <View className="mb-6 flex-row items-center rounded-[28px] bg-card px-4 py-3.5">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Ionicons name="language-outline" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted-foreground">{t("language.title")}</Text>
            <Text className="mt-0.5 text-[15px] font-bold">{t("language.current")}</Text>
          </View>
          <LanguageSwitch className="bg-secondary" />
        </View>

        <Button
          className="h-14 rounded-full bg-foreground"
          onPress={handleLogout}
          isDisabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Spinner color={colors.white} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={colors.white} />
          )}
          <ButtonText className="text-base font-extrabold text-white">
            {isLoggingOut ? t("profile.loggingOut") : t("profile.logOut")}
          </ButtonText>
        </Button>
      </ScrollView>

      <OptionSheet
        visible={isSheetOpen}
        title={t("profile.photoSheetTitle")}
        options={avatarOptions}
        onSelect={handleAvatarOption}
        onClose={() => setIsSheetOpen(false)}
      />
      <CameraCapture
        visible={isCameraOpen}
        onCapture={saveAvatar}
        onClose={() => setIsCameraOpen(false)}
      />
    </View>
  );
}

export default ProfileScreen;
