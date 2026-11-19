import { createStackNavigator } from "@react-navigation/stack";

import AddAttractionScreen from "../screens/AddAttractionScreen";
import AddTripScreen from "../screens/AddTripScreen";
import AttractionDetailsScreen from "../screens/AttractionDetailsScreen";
import CountriesScreen from "../screens/CountriesScreen";
import EditAttractionScreen from "../screens/EditAttractionScreen";
import EditTripScreen from "../screens/EditTripScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import TabsNavigator from "./TabsNavigator";

const Stack = createStackNavigator();

// The tabs are the root of this stack; details, forms, and lists open on top
// of them, so the tab bar is hidden there.
function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="AddTrip" component={AddTripScreen} />
      <Stack.Screen name="EditTrip" component={EditTripScreen} />
      <Stack.Screen name="Countries" component={CountriesScreen} />
      <Stack.Screen name="AttractionDetails" component={AttractionDetailsScreen} />
      <Stack.Screen name="AddAttraction" component={AddAttractionScreen} />
      <Stack.Screen name="EditAttraction" component={EditAttractionScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
