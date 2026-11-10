import { createStackNavigator } from "@react-navigation/stack";
import PlanTripScreen from "../screens/PlanTripScreen";
import TripPlanPreviewScreen from "../screens/TripPlanPreviewScreen";

const Stack = createStackNavigator();

function PlanTripNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlanTrip"
        component={PlanTripScreen}
        options={{ title: "Plan Trip" }}
        initialParams={{ initialStep: 1 }}
      />
      <Stack.Screen
        name="TripPlanPreview"
        component={TripPlanPreviewScreen}
        options={{ title: "Trip Plan Preview" }}
      />
    </Stack.Navigator>
  );
}

export default PlanTripNavigator;
