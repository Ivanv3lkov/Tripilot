import { useState } from "react";
import { Image, ScrollView, useWindowDimensions, View } from "react-native";

import { Text } from "../../components/ui/text";
import { useImageRatios } from "../hooks/useImageRatios";
import { useTranslation } from "../i18n/LanguageContext";
import TripImage from "./TripImage";

const DEFAULT_RATIO = 4 / 3;

// Swipeable photos with page dots. Every photo is shown whole (no crop, no
// zoom): the frame is as tall as the tallest photo needs, up to 70% of the
// screen, and each photo is fitted inside it. Placeholder when there are none.
function PhotoCarousel({ photos, className = "", fallbackCategory = "History" }) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const ratios = useImageRatios(photos.map((photo) => photo.uri));

  if (photos.length === 0) {
    return (
      <TripImage uri={null} category={fallbackCategory} className={`h-72 ${className}`} iconSize={64} />
    );
  }

  const narrowestRatio = Math.min(
    ...photos.map((photo) => ratios[photo.uri] ?? DEFAULT_RATIO),
  );
  const height = width > 0 ? Math.min(width / narrowestRatio, windowHeight * 0.7) : undefined;

  return (
    <View
      className={`w-full overflow-hidden bg-secondary ${className}`}
      style={height ? { height } : { aspectRatio: DEFAULT_RATIO }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) =>
            setPage(Math.round(event.nativeEvent.contentOffset.x / width))
          }
        >
          {photos.map((photo, index) => (
            <Image
              key={photo.id ?? photo.uri}
              source={{ uri: photo.uri }}
              style={{ width, height: "100%" }}
              resizeMode="contain"
              accessibilityLabel={t("multiPhoto.photoOf", { number: index + 1, total: photos.length })}
            />
          ))}
        </ScrollView>
      ) : null}

      {photos.length > 1 ? (
        <>
          <View className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1">
            <Text className="text-xs font-bold text-white">
              {page + 1}/{photos.length}
            </Text>
          </View>
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {photos.map((photo, index) => (
              <View
                key={photo.id ?? photo.uri}
                className={`h-2 rounded-full ${index === page ? "w-5 bg-white" : "w-2 bg-white/60"}`}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

export default PhotoCarousel;
