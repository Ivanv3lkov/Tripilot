import { Image, View } from "react-native";

import { Text } from "../../components/ui/text";

export function getInitials(name, email) {
  const source = name || email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Profile photo, or the user's initials on a coral circle when there is none.
function Avatar({ uri, name, email, size = 44 }) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full bg-primary"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} accessibilityIgnoresInvertColors />
      ) : (
        <Text className="font-extrabold text-white" style={{ fontSize: size * 0.38 }}>
          {getInitials(name, email)}
        </Text>
      )}
    </View>
  );
}

export default Avatar;
