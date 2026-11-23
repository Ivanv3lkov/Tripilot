import { useState } from "react";
import { Image, useWindowDimensions, View } from "react-native";

import { useImageRatios } from "../hooks/useImageRatios";
import TripImage from "./TripImage";

const DEFAULT_RATIO = 4 / 3;

// Shows the whole photo in its own proportions (no crop, no zoom). Very tall
// photos are limited to maxHeight and fitted inside it. Falls back to the
// category icon when there is no photo or it cannot be loaded.
function FitImage({ uri, category, maxHeight, className = "", fallbackHeight = 280 }) {
  const { height: windowHeight } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [failedUri, setFailedUri] = useState(null);
  const ratios = useImageRatios([uri]);

  if (!uri || failedUri === uri) {
    return (
      <TripImage
        uri={null}
        category={category}
        className={className}
        iconSize={64}
        style={{ height: fallbackHeight }}
      />
    );
  }

  const ratio = ratios[uri] ?? DEFAULT_RATIO;
  const limit = maxHeight ?? windowHeight * 0.7;
  const height = width > 0 ? Math.min(width / ratio, limit) : undefined;

  return (
    <View
      className={`w-full overflow-hidden bg-secondary ${className}`}
      style={height ? { height } : { aspectRatio: ratio }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
        onError={() => setFailedUri(uri)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

export default FitImage;
