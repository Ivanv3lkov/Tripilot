import { useState } from "react";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { VStack } from "../../components/ui/vstack";
import AuthFormLayout from "../components/AuthFormLayout";
import FormTextInput from "../components/FormTextInput";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { register } from "../services/authService";
import { validateRegisterForm } from "../utils/validation";

const EMPTY_VALUES = {
  fullName: "",
  email: "",
  password: "",
  repeatPassword: "",
};

function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [confirmationEmail, setConfirmationEmail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field) => (text) => {
    setValues((current) => ({ ...current, [field]: text }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    setConfirmationEmail(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { user, needsEmailConfirmation } = await register(values);
      // Without email confirmation Supabase returns a session and
      // RootNavigator switches to the main app automatically.
      if (needsEmailConfirmation) {
        setConfirmationEmail(user?.email ?? values.email.trim());
        setValues(EMPTY_VALUES);
        setIsSubmitting(false);
      }
    } catch (error) {
      setSubmitError(getErrorMessage(t, error, "errors.register"));
      setIsSubmitting(false);
    }
  };

  const errorText = (field) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <AuthFormLayout
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      keyboardOffset={150}
    >
      <FormTextInput
        label={t("auth.fullName")}
        icon="person-outline"
        value={values.fullName}
        onChangeText={setValue("fullName")}
        error={errorText("fullName")}
        placeholder={t("auth.fullNamePlaceholder")}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
      <FormTextInput
        label={t("auth.email")}
        icon="mail-outline"
        value={values.email}
        onChangeText={setValue("email")}
        error={errorText("email")}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <FormTextInput
        label={t("auth.password")}
        icon="lock-closed-outline"
        value={values.password}
        onChangeText={setValue("password")}
        error={errorText("password")}
        placeholder={t("auth.newPasswordPlaceholder")}
        autoCapitalize="none"
        autoComplete="new-password"
        type="password"
        textContentType="newPassword"
        returnKeyType="next"
        showPasswordToggle={true}
      />
      <FormTextInput
        label={t("auth.repeatPassword")}
        icon="lock-closed-outline"
        value={values.repeatPassword}
        onChangeText={setValue("repeatPassword")}
        error={errorText("repeatPassword")}
        placeholder={t("auth.repeatPasswordPlaceholder")}
        autoCapitalize="none"
        autoComplete="new-password"
        type="password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        showPasswordToggle={true}
      />

      <VStack space="sm" className="mt-1">
        {confirmationEmail ? (
          <Alert>
            <AlertText>
              {t("auth.confirmationSent", { email: confirmationEmail })}
            </AlertText>
          </Alert>
        ) : null}

        {submitError ? (
          <Alert variant="destructive">
            <AlertText>{submitError}</AlertText>
          </Alert>
        ) : null}

        <Button
          className="h-12 rounded-full"
          onPress={handleSubmit}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner className="text-primary-foreground" />
          ) : null}
          <ButtonText className="text-base font-bold">
            {isSubmitting ? t("auth.creatingAccount") : t("auth.createAccount")}
          </ButtonText>
        </Button>

        <Button
          variant="link"
          className="h-9"
          onPress={() => navigation.goBack()}
          isDisabled={isSubmitting}
        >
          <ButtonText>{t("auth.toLogin")}</ButtonText>
        </Button>
      </VStack>
    </AuthFormLayout>
  );
}

export default RegisterScreen;
