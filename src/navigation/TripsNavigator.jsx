import { createStackNavigator } from "@react-navigation/stack";
import TripsScreen from "../screens/TripsScreen";

const Stack = createStackNavigator();

function TripsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Trips"
        component={TripsScreen}
        options={{ title: "Trips" }}
      />
    </Stack.Navigator>
  );
}

export default TripsNavigator;
