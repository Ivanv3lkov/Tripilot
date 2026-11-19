import { useEffect, useState } from "react";
import { View } from "react-native";

import { Spinner } from "../../components/ui/spinner";
import StackHeader from "../components/StackHeader";
import StateMessage from "../components/StateMessage";
import TripForm, { getInitialTripValues } from "../components/TripForm";
import { colors } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { getTrip, updateTrip } from "../services/tripService";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/LanguageContext";

function EditTripScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { tripId } = route.params;
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    getTrip(tripId)
      .then((loadedTrip) => {
        if (isActive) setTrip(loadedTrip);
      })
      .catch((loadError) => {
        if (isActive) setError(loadError);
      });
    return () => {
      isActive = false;
    };
  }, [tripId, attempt]);

  const retry = () => {
    setError(null);
    setAttempt((current) => current + 1);
  };

  const handleSubmit = async (values) => {
    await updateTrip(trip, values, user.id);
    navigation.goBack();
  };

  let content;
  if (error) {
    content = (
      <StateMessage
        tone="error"
        icon="cloud-offline-outline"
        title={t("tripDetails.loadError")}
        message={getErrorMessage(t, error, "errors.loadTrip")}
        actionLabel={t("common.tryAgain")}
        onAction={retry}
      />
    );
  } else if (!trip) {
    content = <Spinner size="large" className="py-16" color={colors.primary} />;
  } else {
    content = (
      <TripForm
        initialValues={getInitialTripValues(trip)}
        submitLabel={t("common.saveChanges")}
        submittingLabel={t("common.saving")}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("tripForm.editTitle")} icon="close" />
      {content}
    </View>
  );
}

export default EditTripScreen;
