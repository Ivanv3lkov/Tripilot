import { createStackNavigator } from "@react-navigation/stack";
import MyTripsScreen from "../screens/MyTripsScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import EditTripScreen from "../screens/EditTripScreen";
import AddPhotoScreen from "../screens/AddPhotoScreen";

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
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: "New Trip" }}
      />
      <Stack.Screen
        name="EditTrip"
        component={EditTripScreen}
        options={{ title: "Edit Trip" }}
      />
      <Stack.Screen
        name="AddPhoto"
        component={AddPhotoScreen}
        options={{ title: "Add Photo" }}
      />
    </Stack.Navigator>
  );
}

export default MyTripsNavigator;
