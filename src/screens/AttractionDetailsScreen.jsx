import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import StackHeader from "../components/StackHeader";
import StateMessage from "../components/StateMessage";
import PhotoCarousel from "../components/PhotoCarousel";
import { colors } from "../constants/theme";
import { deleteAttraction, getAttraction } from "../services/attractionService";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";

function AttractionDetailsScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { attractionId } = route.params;
  const insets = useSafeAreaInsets();
  const [attraction, setAttraction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setAttraction(await getAttraction(attractionId));
      setError(null);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, [attractionId]);

  // Reload on focus so changes made in Edit Attraction are shown.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const runDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAttraction(attraction);
      navigation.goBack();
    } catch (deleteError) {
      setIsDeleting(false);
      Alert.alert(t("attraction.deleteFailed"), getErrorMessage(t, deleteError, "errors.generic"));
    }
  };

  const confirmDelete = () => {
    Alert.alert(t("attraction.deleteTitle"), t("common.deleteMessage", { name: attraction.name }), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: runDelete },
    ]);
  };

  let content;
  if (isLoading) {
    content = <Spinner size="large" className="py-16" color={colors.primary} />;
  } else if (error && !attraction) {
    const isMissing = error.code === "not_found";
    content = (
      <StateMessage
        tone="error"
        icon={isMissing ? "trash-outline" : "cloud-offline-outline"}
        title={isMissing ? t("attraction.notFound") : t("attraction.loadError")}
        message={getErrorMessage(t, error, "errors.loadAttraction")}
        actionLabel={isMissing ? t("common.back") : t("common.tryAgain")}
        onAction={
          isMissing
            ? () => navigation.goBack()
            : () => {
                setIsLoading(true);
                load();
              }
        }
      />
    );
  } else {
    content = (
      <>
        <PhotoCarousel photos={attraction.photos} className="mb-5 rounded-[32px]" />
        <Text className="text-[28px] font-extrabold leading-9">{attraction.name}</Text>
        <Text className="mb-6 mt-3 text-[15px] leading-6 text-muted-foreground">
          {attraction.description || t("attraction.noNotesHint")}
        </Text>

        <View className="flex-row gap-2.5">
          <Button
            className="h-14 flex-1 rounded-full"
            onPress={() => navigation.navigate("EditAttraction", { attractionId: attraction.id })}
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
            accessibilityLabel={t("attraction.delete")}
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
      </>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("attraction.title")} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </View>
  );
}

export default AttractionDetailsScreen;
