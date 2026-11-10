import { createStackNavigator } from "@react-navigation/stack";
import MyTripsScreen from "../screens/MyTripsScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import EditTripScreen from "../screens/EditTripScreen";

const Stack = createStackNavigator();

function MyTripsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{ title: "My Trips" }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        options={{ title: "Trip Details" }}
      />
      <Stack.Screen
        name="EditTrip"
        component={EditTripScreen}
        options={{ title: "Edit Trip" }}
      />
    </Stack.Navigator>
  );
}

export default MyTripsNavigator;
