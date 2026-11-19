import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../../components/ui/text";

// Large-title header used on the tab screens.
function AppHeader({ eyebrow, title, right }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-end justify-between bg-background px-5 pb-3"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="mr-3 flex-1">
        {eyebrow ? (
          <Text className="text-[13px] font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          className="mt-0.5 text-[20px] font-extrabold leading-9"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

export default AppHeader;
