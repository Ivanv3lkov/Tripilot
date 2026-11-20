import { useState } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { MAX_ATTRACTION_PHOTOS } from "../constants/trips";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { validateAttractionForm } from "../utils/validation";
import FormTextInput from "./FormTextInput";
import MultiPhotoField from "./MultiPhotoField";

export function getInitialAttractionValues(attraction) {
  if (!attraction) return { name: "", description: "", photos: [] };
  return {
    name: attraction.name,
    description: attraction.description,
    photos: attraction.photos,
  };
}

function AttractionForm({ initialValues, submitLabel, onSubmit, footer }) {
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
    const nextErrors = validateAttractionForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // On success the screen navigates away, so the form is not reset here.
      await onSubmit(values);
    } catch (error) {
      setSubmitError(getErrorMessage(t, error, "errors.saveAttraction"));
      setIsSubmitting(false);
    }
  };

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
      <View className="mb-4 rounded-[28px] bg-card p-5">
        <Text className="mb-3 text-base font-extrabold">{t("attractionForm.photo")}</Text>
        <MultiPhotoField
          value={values.photos}
          onChange={setValue("photos")}
          max={MAX_ATTRACTION_PHOTOS}
          disabled={isSubmitting}
        />
      </View>

      <View className="mb-4 rounded-[28px] bg-card p-5">
        <Text className="mb-3 text-base font-extrabold">{t("attractionForm.about")}</Text>
        <FormTextInput
          label={t("attractionForm.name")}
          icon="flag-outline"
          value={values.name}
          onChangeText={setValue("name")}
          error={errorText("name")}
          placeholder={t("attractionForm.namePlaceholder")}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <FormTextInput
          label={t("attractionForm.notes")}
          icon="document-text-outline"
          value={values.description}
          onChangeText={setValue("description")}
          error={errorText("description")}
          placeholder={t("attractionForm.notesPlaceholder")}
          multiline
          maxLength={1000}
        />
      </View>

      {submitError ? (
        <Alert variant="destructive" className="mb-3 rounded-2xl">
          <AlertText>{submitError}</AlertText>
        </Alert>
      ) : null}

      <Button className="h-14 rounded-full" onPress={handleSubmit} isDisabled={isSubmitting}>
        {isSubmitting ? <Spinner color={colors.white} /> : null}
        <ButtonText className="text-base font-extrabold">
          {isSubmitting ? t("common.saving") : submitLabel}
        </ButtonText>
      </Button>
      {footer}
    </KeyboardAwareScrollView>
  );
}

export default AttractionForm;
