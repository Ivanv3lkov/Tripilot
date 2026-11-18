import { View, Text, Button } from "react-native";

function ExploreScreen({ navigation }) {
  return (
    <View>
      <Text>Explore Screen</Text>
      {/* TODO: Load suggested destinations from destinationService, add search filter, loading/error/empty states. */}
      <Button
        title="Example destination"
        onPress={() =>
          navigation.navigate("DestinationDetails", {
            destinationId: "example",
          })
        }
      />
    </View>
  );
}

export default ExploreScreen;
