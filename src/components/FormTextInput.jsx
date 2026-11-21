import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../../components/ui/form-control";
import { EyeIcon, EyeOffIcon } from "../../components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "../../components/ui/input";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";

function FormTextInput({ label, error, icon, type = "text", ...inputProps }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isMultiline = Boolean(inputProps.multiline);

  return (
    <FormControl isInvalid={Boolean(error)} className="mb-3">
      <FormControlLabel className="mb-1">
        <FormControlLabelText className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input
        className={`rounded-2xl border-0 bg-secondary px-3.5 data-[focus=true]:border data-[focus=true]:border-primary ${isMultiline ? "min-h-28 items-start py-2" : "min-h-12"}`}
      >
        {icon ? (
          <InputSlot className={isMultiline ? "pt-1.5" : undefined}>
            <Ionicons name={icon} size={18} color={colors.primary} />
          </InputSlot>
        ) : null}
        <InputField
          type={isPassword && showPassword ? "text" : type}
          accessibilityLabel={label}
          className={`text-base ${isMultiline ? "min-h-24" : ""}`}
          textAlignVertical={isMultiline ? "top" : "center"}
          {...inputProps}
        />
        {isPassword ? (
          <InputSlot
            onPress={() => setShowPassword((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            hitSlop={8}
          >
            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
          </InputSlot>
        ) : null}
      </Input>
      {error ? (
        <FormControlError>
          <FormControlErrorText className="text-xs">{error}</FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

export default FormTextInput;
