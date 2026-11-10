import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";

function LoginScreen({ navigation }) {
  const { signIn } = useAuth();

  return (
    <View>
      <Text>Login Screen</Text>
      {/* TODO: Replace with validated form and real auth provider call. */}
      <Button title="Log In" onPress={() => signIn({ email: "" })} />
      <Button
        title="Create an account"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
}

export default LoginScreen;
