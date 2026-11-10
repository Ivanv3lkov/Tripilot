import { View, Text, Button } from "react-native";

function MyTripsScreen({ navigation }) {
  return (
    <View>
      <Text>My Trips Screen</Text>
      {/* TODO: Replace with trips list loaded from the trip service (with pull-to-refresh). */}
      <Button
        title="Example trip"
        onPress={() =>
          navigation.navigate("TripDetails", { tripId: "example" })
        }
      />
    </View>
  );
}

export default MyTripsScreen;
