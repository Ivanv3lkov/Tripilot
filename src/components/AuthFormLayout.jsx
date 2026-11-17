import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "../../components/ui/box";
import { Heading } from "../../components/ui/heading";
import { Text } from "../../components/ui/text";

function AuthFormLayout({ title, subtitle, children, keyboardOffset = 24 }) {
  const insets = useSafeAreaInsets();

  // keyboardOffset is the space kept between the focused input and the keyboard,
  // so the action buttons below the last input stay visible.
  // KeyboardAwareScrollView keeps the focused input above the keyboard on both
  // platforms, including edge-to-edge Android.
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bottomOffset={keyboardOffset}
    >
      <Box className="grow p-6" style={{ paddingBottom: 24 + insets.bottom }}>
        <Heading size="3xl">{title}</Heading>
        {subtitle ? (
          <Text className="mb-6 mt-1 text-muted-foreground">{subtitle}</Text>
        ) : null}
        {children}
      </Box>
    </KeyboardAwareScrollView>
  );
}

export default AuthFormLayout;
