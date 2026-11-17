import { View, Text, Button } from "react-native";

function TripsScreen({ navigation }) {
  const handleSelectDestination = (destination) => {
    navigation.navigate("PlanTripTab", {
      screen: "PlanTrip",
      params: { initialStep: 2, destination },
    });
  };

  return (
    <View>
      <Text>Trips Screen</Text>
      {/* TODO: Replace with destination cards loaded from the external API. */}
      <Button
        title="Example destination"
        onPress={() =>
          handleSelectDestination({ country: "Italy", city: "Rome" })
        }
      />
    </View>
  );
}

export default TripsScreen;
