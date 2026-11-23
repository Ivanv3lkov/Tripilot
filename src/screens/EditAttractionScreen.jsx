import { useEffect, useState } from "react";
import { View } from "react-native";

import { Spinner } from "../../components/ui/spinner";
import AttractionForm, { getInitialAttractionValues } from "../components/AttractionForm";
import StackHeader from "../components/StackHeader";
import StateMessage from "../components/StateMessage";
import { colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { getAttraction, updateAttraction } from "../services/attractionService";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";

function EditAttractionScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { attractionId } = route.params;
  const { user } = useAuth();
  const [attraction, setAttraction] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    getAttraction(attractionId)
      .then((loaded) => {
        if (isActive) setAttraction(loaded);
      })
      .catch((loadError) => {
        if (isActive) setError(loadError);
      });
    return () => {
      isActive = false;
    };
  }, [attractionId, attempt]);

  const handleSubmit = async (values) => {
    await updateAttraction(attraction, values, user.id);
    navigation.goBack();
  };

  let content;
  if (error) {
    content = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("attraction.loadError")}
        message={getErrorMessage(t, error, "errors.loadAttraction")}
        actionLabel={t("common.tryAgain")}
        onAction={() => {
          setError(null);
          setAttempt((current) => current + 1);
        }}
      />
    );
  } else if (!attraction) {
    content = <Spinner size="large" className="py-16" color={colors.primary} />;
  } else {
    content = (
      <AttractionForm
        initialValues={getInitialAttractionValues(attraction)}
        submitLabel={t("common.saveChanges")}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("attraction.editTitle")} icon="close" />
      {content}
    </View>
  );
}

export default EditAttractionScreen;
