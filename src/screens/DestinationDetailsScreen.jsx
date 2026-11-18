import { View, Text, Button } from "react-native";

function DestinationDetailsScreen({ navigation, route }) {
  const { destinationId } = route.params;

  return (
    <View>
      <Text>Destination Details Screen</Text>
      <Text>Destination ID: {destinationId}</Text>
      {/* TODO: Load destination with its five attractions; show Unsplash photo credit links. */}
      <Button
        title="Create trip"
        onPress={() =>
          navigation.navigate("MyTripsTab", {
            screen: "CreateTrip",
            params: { destinationId },
            // Keep MyTrips as the stack root when the tab was not opened yet.
            initial: false,
          })
        }
      />
    </View>
  );
}

export default DestinationDetailsScreen;
