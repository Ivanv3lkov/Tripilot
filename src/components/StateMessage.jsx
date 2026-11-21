import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Button, ButtonText } from "../../components/ui/button";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";

// Shared empty and error state with an optional action (Retry, Add trip, ...).
function StateMessage({ icon, title, message, actionLabel, onAction, tone = "default" }) {
  const isError = tone === "error";
  return (
    <View className="items-center px-6 py-12">
      <View
        className={`mb-4 h-20 w-20 items-center justify-center rounded-[28px] ${isError ? "bg-destructive/10" : "bg-accent"}`}
        style={{ transform: [{ rotate: "-6deg" }] }}
      >
        <Ionicons name={icon} size={36} color={isError ? colors.danger : colors.primary} />
      </View>
      <Text className="text-center text-xl font-extrabold">{title}</Text>
      {message ? (
        <Text className="mt-1.5 text-center text-sm leading-5 text-muted-foreground">{message}</Text>
      ) : null}
      {actionLabel ? (
        <Button className="mt-5 h-auto rounded-full px-7 py-3" onPress={onAction}>
          <ButtonText className="font-bold">{actionLabel}</ButtonText>
        </Button>
      ) : null}
    </View>
  );
}

export default StateMessage;
