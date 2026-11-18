import { useState } from "react";
import { Alert, View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";

function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Log out failed", error.message);
      setIsLoggingOut(false);
    }
  };

  return (
    <View>
      <Text>Profile Screen</Text>
      {user?.fullName ? <Text>{user.fullName}</Text> : null}
      <Text>{user?.email}</Text>
      <Button
        title={isLoggingOut ? "Logging out..." : "Log Out"}
        onPress={handleLogout}
        disabled={isLoggingOut}
      />
    </View>
  );
}

export default ProfileScreen;
