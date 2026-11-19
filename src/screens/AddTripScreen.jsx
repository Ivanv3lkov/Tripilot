import { View } from "react-native";

import StackHeader from "../components/StackHeader";
import TripForm, { getInitialTripValues } from "../components/TripForm";
import { useAuth } from "../contexts/AuthContext";
import { createTrip } from "../services/tripService";
import { useTranslation } from "../i18n/LanguageContext";

function AddTripScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleSubmit = async (values) => {
    const trip = await createTrip(values, user.id);
    navigation.replace("TripDetails", { tripId: trip.id });
  };

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("tripForm.newTitle")} icon="close" />
      <TripForm
        initialValues={getInitialTripValues(null)}
        submitLabel={t("tripForm.saveNew")}
        submittingLabel={t("common.saving")}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

export default AddTripScreen;
