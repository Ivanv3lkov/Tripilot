import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";
import { pickManyFromGallery } from "../utils/pickImage";
import CameraCapture from "./CameraCapture";

function AddButton({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-accent py-3 active:opacity-80 ${disabled ? "opacity-50" : ""}`}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text className="text-sm font-bold text-primary">{label}</Text>
    </Pressable>
  );
}

// Up to `max` photos. value: [{ id?, uri, path?, mimeType? }]; items with
// an `id` are already saved, the others are new local photos.
function MultiPhotoField({ value, onChange, max, disabled = false }) {
  const { t } = useTranslation();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const remaining = max - value.length;

  const addFromGallery = async () => {
    const photos = await pickManyFromGallery({ limit: remaining, t });
    if (photos.length > 0) onChange([...value, ...photos].slice(0, max));
  };

  const removeAt = (index) => onChange(value.filter((_, itemIndex) => itemIndex !== index));

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("multiPhoto.label")}
        </Text>
        <Text className="text-xs font-bold text-primary">
          {t("multiPhoto.counter", { count: value.length, max })}
        </Text>
      </View>

      {value.length > 0 ? (
        <View className="mb-3 flex-row gap-2">
          {value.map((photo, index) => (
            <View key={photo.id ?? photo.uri} className="aspect-square flex-1 overflow-hidden rounded-2xl bg-secondary" style={{ maxWidth: "32%" }}>
              <Image
                source={{ uri: photo.uri }}
                className="h-full w-full"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <Pressable
                onPress={() => removeAt(index)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={t("multiPhoto.remove", { number: index + 1 })}
                hitSlop={6}
                className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/60"
              >
                <Ionicons name="close" size={16} color={colors.white} />
              </Pressable>
              {index === 0 ? (
                <View className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-white">{t("multiPhoto.cover")}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {remaining > 0 ? (
        <>
          <View className="mb-1 flex-row gap-2.5">
            <AddButton
              icon="camera"
              label={t("photo.take")}
              onPress={() => setIsCameraOpen(true)}
              disabled={disabled}
            />
            <AddButton
              icon="images"
              label={t("photo.gallery")}
              onPress={addFromGallery}
              disabled={disabled}
            />
          </View>
          <Text className="mb-1 text-xs text-muted-foreground">
            {t("multiPhoto.hint", { count: remaining })}
          </Text>
        </>
      ) : (
        <Text className="text-xs text-muted-foreground">{t("multiPhoto.full", { max })}</Text>
      )}

      <CameraCapture
        visible={isCameraOpen}
        onCapture={(photo) => onChange([...value, photo].slice(0, max))}
        onClose={() => setIsCameraOpen(false)}
      />
    </View>
  );
}

export default MultiPhotoField;
