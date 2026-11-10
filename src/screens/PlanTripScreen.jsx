import { useState } from "react";
import { View, Text, Button } from "react-native";

const TOTAL_STEPS = 3;

function PlanTripScreen({ navigation, route }) {
  const params = route.params;
  const destination = params?.destination;
  const [step, setStep] = useState(params?.initialStep ?? 1);
  const [prevParams, setPrevParams] = useState(params);

  // Screen stays mounted in the tab, so reset the step when entry params change.
  if (params !== prevParams) {
    setPrevParams(params);
    setStep(params?.initialStep ?? 1);
  }

  return (
    <View>
      <Text>Plan Trip Screen</Text>
      <Text>
        Step {step} of {TOTAL_STEPS}
      </Text>
      {destination ? (
        <Text>
          Destination:{" "}
          {[destination.city, destination.country].filter(Boolean).join(", ")}
        </Text>
      ) : null}

      {step > 1 ? (
        <Button title="Back" onPress={() => setStep(step - 1)} />
      ) : null}
      {step < TOTAL_STEPS ? (
        <Button title="Next" onPress={() => setStep(step + 1)} />
      ) : (
        <Button
          title="Plan my trip"
          onPress={() =>
            navigation.navigate("TripPlanPreview", { destination })
          }
        />
      )}
    </View>
  );
}

export default PlanTripScreen;
