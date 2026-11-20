import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Image, Linking, Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonText } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { useTranslation } from "../i18n/LanguageContext";

function RoundButton({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-12 w-12 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
    >
      <Ionicons name={icon} size={24} color={colors.white} />
    </Pressable>
  );
}

// Full-screen in-app camera. Calls onCapture({ uri, mimeType }) after the user
// confirms the photo.
function CameraCapture({ visible, onCapture, onClose }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [isReady, setIsReady] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Ask for permission as soon as the camera opens (only when it can be asked).
  const shouldAsk = visible && permission && !permission.granted && permission.canAskAgain;
  useEffect(() => {
    if (shouldAsk) requestPermission();
  }, [shouldAsk, requestPermission]);

  const close = () => {
    setPreview(null);
    setError(null);
    setIsReady(false);
    onClose();
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isReady || isTaking) return;
    setIsTaking(true);
    setError(null);
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPreview(picture.uri);
    } catch {
      setError(t("camera.takeFailed"));
    } finally {
      setIsTaking(false);
    }
  };

  const usePhoto = () => {
    onCapture({ uri: preview, mimeType: "image/jpeg" });
    close();
  };

  let content;
  if (!permission) {
    content = <Spinner size="large" color={colors.white} className="flex-1" />;
  } else if (!permission.granted) {
    content = (
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="camera-outline" size={56} color={colors.white} />
        <Text className="mt-4 text-center text-xl font-extrabold text-white">
          {t("camera.permissionTitle")}
        </Text>
        <Text className="mt-2 text-center text-sm text-white/75">
          {t("camera.permissionMessage")}
        </Text>
        <Button
          className="mt-6 h-12 rounded-full bg-white px-8"
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
        >
          <ButtonText className="font-bold text-primary">
            {permission.canAskAgain ? t("camera.allow") : t("common.openSettings")}
          </ButtonText>
        </Button>
      </View>
    );
  } else if (preview) {
    content = (
      <View className="flex-1">
        <Image source={{ uri: preview }} className="flex-1" resizeMode="contain" />
        <View
          className="flex-row gap-3 px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-full border-white/40 bg-transparent"
            onPress={() => setPreview(null)}
          >
            <ButtonText className="font-bold text-white">{t("camera.retake")}</ButtonText>
          </Button>
          <Button className="h-12 flex-1 rounded-full" onPress={usePhoto}>
            <ButtonText className="font-bold">{t("camera.usePhoto")}</ButtonText>
          </Button>
        </View>
      </View>
    );
  } else {
    content = (
      <View className="flex-1">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          onCameraReady={() => setIsReady(true)}
          onMountError={() => setError(t("camera.startFailed"))}
        />
        {error ? (
          <Text className="px-5 pt-3 text-center text-sm text-white">{error}</Text>
        ) : null}
        <View
          className="flex-row items-center justify-between px-10 pt-5"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="h-12 w-12" />
          <Pressable
            onPress={takePicture}
            disabled={!isReady || isTaking}
            accessibilityRole="button"
            accessibilityLabel={t("photo.take")}
            className="h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white"
          >
            <View className={`h-[60px] w-[60px] rounded-full ${isReady ? "bg-white" : "bg-white/40"}`}>
              {isTaking ? <Spinner color={colors.primary} className="flex-1" /> : null}
            </View>
          </Pressable>
          <RoundButton
            icon="camera-reverse"
            label={t("camera.switch")}
            onPress={() => {
              setIsReady(false);
              setFacing((current) => (current === "back" ? "front" : "back"));
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <RoundButton icon="close" label={t("camera.close")} onPress={close} />
          <Text className="text-base font-bold text-white">
            {preview ? t("camera.confirmTitle") : t("camera.title")}
          </Text>
          <View className="h-12 w-12" />
        </View>
        {content}
      </View>
    </Modal>
  );
}

export default CameraCapture;
