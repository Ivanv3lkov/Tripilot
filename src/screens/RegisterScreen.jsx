import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";

function RegisterScreen({ navigation }) {
  const { signIn } = useAuth();

  return (
    <View>
      <Text>Register Screen</Text>
      {/* TODO: Replace with validated form and real auth provider call. */}
      <Button title="Register" onPress={() => signIn({ email: "" })} />
      <Button
        title="Already have an account? Log in"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

export default RegisterScreen;
