import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import TripsNavigator from "./TripsNavigator";
import PlanTripNavigator from "./PlanTripNavigator";
import MyTripsNavigator from "./MyTripsNavigator";
import ProfileNavigator from "./ProfileNavigator";

const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="TripsTab"
        component={TripsNavigator}
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="PlanTripTab"
        component={PlanTripNavigator}
        options={{
          title: "Plan Trip",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
        }}
        listeners={({ navigation }) => ({
          // Direct tab entry always starts the wizard at step 1.
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate("PlanTripTab", {
              screen: "PlanTrip",
              params: { initialStep: 1 },
            });
          },
        })}
      />
      <Tabs.Screen
        name="MyTripsTab"
        component={MyTripsNavigator}
        options={{
          title: "My Trips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmarks" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default TabsNavigator;
