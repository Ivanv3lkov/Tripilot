import { View, Text, Button } from "react-native";

function TripDetailsScreen({ navigation, route }) {
  const { tripId } = route.params;

  return (
    <View>
      <Text>Trip Details Screen</Text>
      <Text>Trip ID: {tripId}</Text>
      {/* TODO: Load trip, destination attractions and photos; delete with confirmation. */}
      <Button
        title="Edit"
        onPress={() => navigation.navigate("EditTrip", { tripId })}
      />
      <Button
        title="Add photo"
        onPress={() => navigation.navigate("AddPhoto", { tripId })}
      />
    </View>
  );
}

export default TripDetailsScreen;
