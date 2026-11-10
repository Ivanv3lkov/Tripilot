import { View, Text, Button } from "react-native";

function TripDetailsScreen({ navigation, route }) {
  const { tripId } = route.params;

  return (
    <View>
      <Text>Trip Details Screen</Text>
      <Text>Trip ID: {tripId}</Text>
      <Button
        title="Edit"
        onPress={() => navigation.navigate("EditTrip", { tripId })}
      />
    </View>
  );
}

export default TripDetailsScreen;
