import { View, Text, Button } from "react-native";

function EditTripScreen({ navigation, route }) {
  const { tripId } = route.params;

  return (
    <View>
      <Text>Edit Trip Screen</Text>
      <Text>Trip ID: {tripId}</Text>
      {/* TODO: Load trip, validate form, and update through the trip service. */}
      <Button title="Save" onPress={() => navigation.goBack()} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default EditTripScreen;
