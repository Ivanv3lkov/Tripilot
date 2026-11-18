import { createStackNavigator } from "@react-navigation/stack";

import { Box } from "../../components/ui/box";
import { Spinner } from "../../components/ui/spinner";
import { useAuth } from "../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabsNavigator from "./TabsNavigator";

const Stack = createStackNavigator();

function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <Box className="flex-1 items-center justify-center bg-background">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={TabsNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
