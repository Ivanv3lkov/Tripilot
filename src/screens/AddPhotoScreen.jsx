import { View, Text, Button } from "react-native";

function AddPhotoScreen({ navigation, route }) {
  const { tripId } = route.params;

  return (
    <View>
      <Text>Add Photo Screen</Text>
      <Text>Trip ID: {tripId}</Text>
      {/* TODO: Camera/gallery via Expo ImagePicker, optional attraction and caption, upload through photoService. */}
      <Button title="Upload" onPress={() => navigation.goBack()} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default AddPhotoScreen;
