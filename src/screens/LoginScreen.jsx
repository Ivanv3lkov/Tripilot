import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { VStack } from "../../components/ui/vstack";
import AuthFormLayout from "../components/AuthFormLayout";
import FormTextInput from "../components/FormTextInput";
import { login } from "../services/authService";
import { validateLoginForm } from "../utils/validation";

function LoginScreen({ navigation }) {
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
      setSubmitError(error.message || "Could not log in. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Welcome back"
      subtitle="Log in to continue planning."
    >
      <FormTextInput
        label="Email"
        value={values.email}
        onChangeText={setValue("email")}
        error={errors.email}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <FormTextInput
        label="Password"
        value={values.password}
        onChangeText={setValue("password")}
        error={errors.password}
        placeholder="Your password"
        autoCapitalize="none"
        autoComplete="current-password"
        type="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <VStack space="md">
        {submitError ? (
          <Alert variant="destructive">
            <AlertText>{submitError}</AlertText>
          </Alert>
        ) : null}

        <Button onPress={handleSubmit} isDisabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner className="text-primary-foreground" />
          ) : null}
          <ButtonText>{isSubmitting ? "Logging in..." : "Log In"}</ButtonText>
        </Button>

        <Button
          variant="link"
          onPress={() => navigation.navigate("Register")}
          isDisabled={isSubmitting}
        >
          <ButtonText>Do not have an account? Register</ButtonText>
        </Button>
      </VStack>
    </AuthFormLayout>
  );
}

export default LoginScreen;
