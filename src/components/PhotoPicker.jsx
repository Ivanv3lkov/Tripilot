import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";
import { pickFromGallery } from "../utils/pickImage";
import CameraCapture from "./CameraCapture";
import FitImage from "./FitImage";

function SourceButton({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-1 items-center rounded-3xl border border-dashed border-primary/40 bg-accent py-4 active:opacity-80 ${disabled ? "opacity-50" : ""}`}
    >
      <View className="mb-2 h-11 w-11 items-center justify-center rounded-full bg-primary">
        <Ionicons name={icon} size={22} color={colors.white} />
      </View>
      <Text className="text-sm font-bold text-primary">{label}</Text>
    </Pressable>
  );
}

// value: { uri, mimeType?, path? } | null. A value with `path` is a photo that
// was already uploaded to Storage.
function PhotoPicker({ value, onChange, disabled = false }) {
  const { t } = useTranslation();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const chooseFromGallery = async () => {
    const photo = await pickFromGallery({ t });
    if (photo) onChange(photo);
  };

  return (
    <>
      {value ? (
        <View className="mb-3 overflow-hidden rounded-3xl bg-card">
          <FitImage uri={value.uri} maxHeight={360} />
          <View className="absolute bottom-3 right-3 flex-row gap-2">
            <Pressable
              onPress={() => setIsCameraOpen(true)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={t("photo.retakeNew")}
              className="h-9 w-9 items-center justify-center rounded-full bg-black/55"
            >
              <Ionicons name="camera" size={16} color={colors.white} />
            </Pressable>
            <Pressable
              onPress={chooseFromGallery}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={t("photo.chooseAnother")}
              className="h-9 w-9 items-center justify-center rounded-full bg-black/55"
            >
              <Ionicons name="images" size={16} color={colors.white} />
            </Pressable>
            <Pressable
              onPress={() => onChange(null)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={t("photo.remove")}
              className="h-9 w-9 items-center justify-center rounded-full bg-black/55"
            >
              <Ionicons name="trash-outline" size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="mb-3 flex-row gap-3">
          <SourceButton icon="camera" label={t("photo.take")} onPress={() => setIsCameraOpen(true)} disabled={disabled} />
          <SourceButton icon="images" label={t("photo.gallery")} onPress={chooseFromGallery} disabled={disabled} />
        </View>
      )}

      <CameraCapture
        visible={isCameraOpen}
        onCapture={onChange}
        onClose={() => setIsCameraOpen(false)}
      />
    </>
  );
}

export default PhotoPicker;
