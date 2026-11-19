import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TabBar from "../components/TabBar";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import StatsScreen from "../screens/StatsScreen";
import TripsScreen from "../screens/TripsScreen";
import { useTranslation } from "../i18n/LanguageContext";

const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="Trips" component={TripsScreen} options={{ title: t("tabs.trips") }} />
      <Tabs.Screen name="Stats" component={StatsScreen} options={{ title: t("tabs.stats") }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: t("tabs.profile") }} />
    </Tabs.Navigator>
  );
}

export default TabsNavigator;
