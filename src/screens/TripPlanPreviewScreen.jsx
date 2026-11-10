import { View, Text, Button } from "react-native";

function TripPlanPreviewScreen({ navigation, route }) {
  const destination = route.params?.destination;

  return (
    <View>
      <Text>Trip Plan Preview Screen</Text>
      {destination ? (
        <Text>
          Destination:{" "}
          {[destination.city, destination.country].filter(Boolean).join(", ")}
        </Text>
      ) : null}
      {/* TODO: Render generated itinerary and save it through the trip service. */}
      <Button
        title="Save Trip"
        onPress={() => navigation.navigate("MyTripsTab", { screen: "MyTrips" })}
      />
      <Button title="Edit Preferences" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default TripPlanPreviewScreen;
