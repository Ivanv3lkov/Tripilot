import { View, Text, Button } from "react-native";

function CreateTripScreen({ navigation, route }) {
  const destinationId = route.params?.destinationId;

  return (
    <View>
      <Text>Create Trip Screen</Text>
      {destinationId ? <Text>Destination ID: {destinationId}</Text> : null}
      {/* TODO: Destination picker, title, dates, notes; validate and create through tripService. */}
      <Button title="Save" onPress={() => navigation.goBack()} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default CreateTripScreen;
