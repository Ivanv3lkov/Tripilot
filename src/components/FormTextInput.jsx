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

function FormTextInput({ label, error, type = "text", ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <FormControl isInvalid={Boolean(error)} className="mb-4">
      <FormControlLabel className="mb-1.5">
        <FormControlLabelText className="font-semibold">
          {label}
        </FormControlLabelText>
      </FormControlLabel>
      <Input>
        <InputField
          type={isPassword && showPassword ? "text" : type}
          accessibilityLabel={label}
          {...inputProps}
        />
        {isPassword ? (
          <InputSlot
            onPress={() => setShowPassword((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            hitSlop={8}
          >
            <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
          </InputSlot>
        ) : null}
      </Input>
      {error ? (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

export default FormTextInput;
