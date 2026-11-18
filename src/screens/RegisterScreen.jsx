import { useState } from "react";

import { Alert, AlertText } from "../../components/ui/alert";
import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { VStack } from "../../components/ui/vstack";
import AuthFormLayout from "../components/AuthFormLayout";
import FormTextInput from "../components/FormTextInput";
import { register } from "../services/authService";
import { validateRegisterForm } from "../utils/validation";

const EMPTY_VALUES = {
  fullName: "",
  email: "",
  password: "",
  repeatPassword: "",
};

function RegisterScreen({ navigation }) {
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
      setSubmitError(
        error.message || "Could not create the account. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="Join Tripilot to plan your next trip."
      keyboardOffset={150}
    >
      <FormTextInput
        label="Full name"
        value={values.fullName}
        onChangeText={setValue("fullName")}
        error={errors.fullName}
        placeholder="Jane Doe"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
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
        placeholder="At least 8 characters, letters and numbers"
        autoCapitalize="none"
        autoComplete="new-password"
        type="password"
        textContentType="newPassword"
        returnKeyType="next"
        showPasswordToggle={true}
      />
      <FormTextInput
        label="Repeat password"
        value={values.repeatPassword}
        onChangeText={setValue("repeatPassword")}
        error={errors.repeatPassword}
        placeholder="Repeat your password"
        autoCapitalize="none"
        autoComplete="new-password"
        type="password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        showPasswordToggle={true}
      />

      <VStack space="md">
        {confirmationEmail ? (
          <Alert>
            <AlertText>
              Account created. We sent a confirmation link to{" "}
              {confirmationEmail}. Confirm your email, then log in.
            </AlertText>
          </Alert>
        ) : null}

        {submitError ? (
          <Alert variant="destructive">
            <AlertText>{submitError}</AlertText>
          </Alert>
        ) : null}

        <Button onPress={handleSubmit} isDisabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner className="text-primary-foreground" />
          ) : null}
          <ButtonText>
            {isSubmitting ? "Creating account..." : "Register"}
          </ButtonText>
        </Button>

        <Button
          variant="link"
          onPress={() => navigation.goBack()}
          isDisabled={isSubmitting}
        >
          <ButtonText>Already have an account? Log in</ButtonText>
        </Button>
      </VStack>
    </AuthFormLayout>
  );
}

export default RegisterScreen;
