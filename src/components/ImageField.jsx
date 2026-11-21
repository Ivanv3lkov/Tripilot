import { View } from "react-native";

import { useTranslation } from "../i18n/LanguageContext";
import Chip from "./Chip";
import FormTextInput from "./FormTextInput";
import PhotoPicker from "./PhotoPicker";
import FitImage from "./FitImage";

// "Upload a photo" (camera/gallery) or "paste an image link" for a form.
// Uses values.imageMode, values.photo, and values.imageUrl.
function ImageField({ values, error, setValue, disabled, fallbackCategory }) {
  const { t } = useTranslation();
  const imageUrlPreview = values.imageUrl.trim();

  return (
    <View>
      <View className="flex-row">
        <Chip
          label={t("image.upload")}
          icon="cloud-upload-outline"
          active={values.imageMode === "photo"}
          onPress={() => setValue("imageMode")("photo")}
        />
        <Chip
          label={t("image.link")}
          icon="link-outline"
          active={values.imageMode === "url"}
          onPress={() => setValue("imageMode")("url")}
        />
      </View>

      {values.imageMode === "photo" ? (
        <PhotoPicker value={values.photo} onChange={setValue("photo")} disabled={disabled} />
      ) : (
        <View>
          {imageUrlPreview && !error ? (
            <FitImage
              uri={imageUrlPreview}
              category={fallbackCategory}
              maxHeight={300}
              className="mb-3 rounded-3xl"
            />
          ) : null}
          <FormTextInput
            label={t("image.linkLabel")}
            icon="link-outline"
            value={values.imageUrl}
            onChangeText={setValue("imageUrl")}
            error={error}
            placeholder="https://example.com/photo.jpg"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            textContentType="URL"
          />
        </View>
      )}
    </View>
  );
}

export default ImageField;
