import { View } from "react-native";

import AttractionForm, { getInitialAttractionValues } from "../components/AttractionForm";
import StackHeader from "../components/StackHeader";
import { useAuth } from "../contexts/AuthContext";
import { createAttraction } from "../services/attractionService";
import { useTranslation } from "../i18n/LanguageContext";

function AddAttractionScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { tripId } = route.params;
  const { user } = useAuth();

  const handleSubmit = async (values) => {
    await createAttraction(tripId, values, user.id);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <StackHeader title={t("attraction.newTitle")} icon="close" />
      <AttractionForm
        initialValues={getInitialAttractionValues(null)}
        submitLabel={t("attraction.add")}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

export default AddAttractionScreen;
