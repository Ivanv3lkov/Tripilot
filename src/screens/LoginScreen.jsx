import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { VStack } from "../../components/ui/vstack";
import AuthFormLayout from "../components/AuthFormLayout";
import FormTextInput from "../components/FormTextInput";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";
import { login } from "../services/authService";
import { validateLoginForm } from "../utils/validation";

function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(
      () => () => {
        setValues({ email: "", password: "" });
        setErrors({});
        setSubmitError(null);
      },
      [],
    ),
  );

  const setValue = (field) => (text) => {
    setValues((current) => ({ ...current, [field]: text }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // On success AuthContext receives the new session and RootNavigator
      // switches to the main app.
      await login(values);
    } catch (error) {
      setSubmitError(getErrorMessage(t, error, "errors.login"));
      setIsSubmitting(false);
    }
  };

  const errorText = (field) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <AuthFormLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
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
        placeholder={t("auth.passwordPlaceholder")}
        autoCapitalize="none"
        autoComplete="current-password"
        type="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <VStack space="sm" className="mt-1">
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
            {isSubmitting ? t("auth.loggingIn") : t("auth.logIn")}
          </ButtonText>
        </Button>

        <Button
          variant="link"
          className="h-9"
          onPress={() => navigation.navigate("Register")}
          isDisabled={isSubmitting}
        >
          <ButtonText>{t("auth.toRegister")}</ButtonText>
        </Button>
      </VStack>
    </AuthFormLayout>
  );
}

export default LoginScreen;
