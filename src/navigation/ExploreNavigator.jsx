import { createStackNavigator } from "@react-navigation/stack";
import ExploreScreen from "../screens/ExploreScreen";
import DestinationDetailsScreen from "../screens/DestinationDetailsScreen";

const Stack = createStackNavigator();

function ExploreNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: "Explore" }}
      />
      <Stack.Screen
        name="DestinationDetails"
        component={DestinationDetailsScreen}
        options={{ title: "Destination" }}
      />
    </Stack.Navigator>
  );
}

export default ExploreNavigator;
