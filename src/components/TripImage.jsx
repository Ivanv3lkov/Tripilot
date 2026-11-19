import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, View } from "react-native";

import { colors } from "../constants/theme";
import { getCategoryIcon } from "../constants/trips";

// Shows the trip photo, or the category icon when there is no image or it fails to load.
function TripImage({ uri, category, className = "", iconSize = 48, style }) {
  const [failedUri, setFailedUri] = useState(null);
  const showImage = Boolean(uri) && failedUri !== uri;

  return (
    <View className={`items-center justify-center overflow-hidden bg-accent ${className}`} style={style}>
      {showImage ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          resizeMode="cover"
          onError={() => setFailedUri(uri)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Ionicons name={getCategoryIcon(category)} size={iconSize} color={colors.primary} />
      )}
    </View>
  );
}

export default TripImage;
