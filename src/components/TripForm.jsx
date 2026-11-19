import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Switch, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { CATEGORIES, CATEGORY_VALUES } from "../constants/trips";
import { fromDateOnly } from "../utils/date";
import { validateTripForm } from "../utils/validation";
import Chip from "./Chip";
import DatePickerField from "./DatePickerField";
import FormTextInput from "./FormTextInput";
import ImageField from "./ImageField";
import LocationField from "./LocationField";
import RatingStars from "./RatingStars";

export function getInitialTripValues(trip) {
  if (!trip) {
    return {
      title: "",
      location: "",
      visitDate: new Date(),
      description: "",
      category: "City",
      rating: 0,
      isFavorite: false,
      imageMode: "photo",
      imageUrl: "",
      photo: null,
    };
  }

  const isUploaded = Boolean(trip.imagePath);
  return {
    title: trip.title,
    location: trip.location,
    visitDate: fromDateOnly(trip.visitDate),
    description: trip.description,
    category: trip.category,
    rating: trip.rating,
    isFavorite: trip.isFavorite,
    imageMode: trip.imageUrl && !isUploaded ? "url" : "photo",
    imageUrl: isUploaded ? "" : (trip.imageUrl ?? ""),
    photo: isUploaded ? { uri: trip.imageUrl, path: trip.imagePath } : null,
  };
}

function Section({ title, children }) {
  return (
    <View className="mb-4 rounded-[28px] bg-card p-5">
      <Text className="mb-3 text-base font-extrabold">{title}</Text>
      {children}
    </View>
  );
}

function SmallLabel({ children }) {
  return (
    <Text className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </Text>
  );
}

function TripForm({ initialValues, submitLabel, submittingLabel, onSubmit }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field) => (value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateTripForm(values, CATEGORY_VALUES);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(t("form.checkFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      // On success the screen navigates away, so the form is not reset here.
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getErrorMessage(t, error, "errors.saveTrip"));
      setIsSubmitting(false);
    }
  };

  // Validators return keys; translate them for display.
  const errorText = (field) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bottomOffset={24}
      showsVerticalScrollIndicator={false}
    >
      <Section title={t("tripForm.coverPhoto")}>
        <ImageField
          values={values}
          error={errorText("imageUrl")}
          setValue={setValue}
          disabled={isSubmitting}
          fallbackCategory={values.category}
        />
      </Section>

      <Section title={t("tripForm.details")}>
        <FormTextInput
          label={t("tripForm.title")}
          icon="pricetag-outline"
          value={values.title}
          onChangeText={setValue("title")}
          error={errorText("title")}
          placeholder={t("tripForm.titlePlaceholder")}
          autoCapitalize="sentences"
          returnKeyType="next"
        />
        <LocationField
          value={values.location}
          onChange={setValue("location")}
          error={errorText("location")}
          disabled={isSubmitting}
        />
        <DatePickerField
          label={t("tripForm.visitDate")}
          value={values.visitDate}
          onChange={setValue("visitDate")}
          error={errorText("visitDate")}
          disabled={isSubmitting}
        />
        <FormTextInput
          label={t("tripForm.story")}
          icon="document-text-outline"
          value={values.description}
          onChangeText={setValue("description")}
          error={errorText("description")}
          placeholder={t("tripForm.storyPlaceholder")}
          multiline
          maxLength={1000}
        />
      </Section>

      <Section title={t("tripForm.mood")}>
        <SmallLabel>{t("tripForm.category")}</SmallLabel>
        <View className="mb-2 flex-row flex-wrap">
          {CATEGORIES.map((category) => (
            <Chip
              key={category.value}
              label={t(`categories.${category.value}`)}
              icon={category.icon}
              active={values.category === category.value}
              onPress={() => setValue("category")(category.value)}
            />
          ))}
        </View>
        {errors.category ? (
          <Text className="mb-3 text-xs text-destructive">{errorText("category")}</Text>
        ) : null}

        <SmallLabel>{t("tripForm.rating")}</SmallLabel>
        <View className="mb-4">
          <RatingStars rating={values.rating} size={32} onChange={setValue("rating")} />
        </View>

        <View className="flex-row items-center rounded-2xl bg-secondary px-4 py-3">
          <Ionicons
            name={values.isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={colors.primary}
          />
          <Text className="ml-2.5 flex-1 text-[15px] font-bold">{t("tripForm.favorite")}</Text>
          <Switch
            value={values.isFavorite}
            onValueChange={setValue("isFavorite")}
            disabled={isSubmitting}
            trackColor={{ false: colors.starEmpty, true: colors.primary }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.starEmpty}
            accessibilityLabel={t("tripForm.favorite")}
          />
        </View>
      </Section>

      {submitError ? (
        <Alert variant="destructive" className="mb-3 rounded-2xl">
          <AlertText>{submitError}</AlertText>
        </Alert>
      ) : null}

      <Button className="h-14 rounded-full" onPress={handleSubmit} isDisabled={isSubmitting}>
        {isSubmitting ? <Spinner color={colors.white} /> : null}
        <ButtonText className="text-base font-extrabold">
          {isSubmitting ? submittingLabel : submitLabel}
        </ButtonText>
      </Button>
    </KeyboardAwareScrollView>
  );
}

export default TripForm;
