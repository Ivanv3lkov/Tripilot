import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

// Opens the gallery and returns { uri, mimeType } or null when the user cancels
// or denies access. Photos from the camera use CameraCapture (expo-camera)
// instead: ImagePicker.launchCameraAsync() does not open the camera on some
// Android devices (https://github.com/expo/expo/issues/39480).
// t: the translate function from useTranslation, used for the alerts.
// crop: an aspect such as [1, 1] opens the crop editor (avatar); without it
// the photo is kept exactly as it is.
export async function pickFromGallery({ crop, t }) {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("photo.galleryDeniedTitle"), t("photo.galleryDeniedMessage"));
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: Boolean(crop),
      aspect: crop,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];
    return { uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" };
  } catch {
    Alert.alert(t("common.somethingWrong"), t("photo.galleryFailed"));
    return null;
  }
}

// Lets the user pick up to `limit` photos at once (no cropping: the system
// picker does not support cropping with multiple selection). Returns an array.
export async function pickManyFromGallery({ limit, t }) {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("photo.galleryDeniedTitle"), t("photo.galleryDeniedMessage"));
      return [];
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: limit,
      orderedSelection: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return [];
    // Some Android versions ignore selectionLimit, so enforce it here as well.
    return result.assets.slice(0, limit).map((asset) => ({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
    }));
  } catch {
    Alert.alert(t("common.somethingWrong"), t("photo.galleryFailed"));
    return [];
  }
}
