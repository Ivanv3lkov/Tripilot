import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";

function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <View>
      <Text>Profile Screen</Text>
      <Button title="Log Out" onPress={signOut} />
    </View>
  );
}

export default ProfileScreen;
