import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, View } from "react-native";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "../../components/ui/form-control";
import { Text } from "../../components/ui/text";
import { colors } from "../constants/theme";
import { formatDate, toDateOnly } from "../utils/date";
import { useTranslation } from "../i18n/LanguageContext";

function DatePickerField({ label, value, onChange, error, disabled = false }) {
  const { locale } = useTranslation();
  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value,
      mode: "date",
      onValueChange: (_event, date) => {
        if (date) onChange(date);
      },
    });
  };

  return (
    <FormControl isInvalid={Boolean(error)} className="mb-3">
      <FormControlLabel className="mb-1">
        <FormControlLabelText className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      {Platform.OS === "ios" ? (
        <View className="min-h-12 flex-row items-center rounded-2xl bg-secondary px-3.5">
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <View className="flex-1 items-end">
            <DateTimePicker
              value={value}
              mode="date"
              display="compact"
              locale={locale}
              disabled={disabled}
              accentColor={colors.primary}
              onValueChange={(_event, date) => {
                if (date) onChange(date);
              }}
            />
          </View>
        </View>
      ) : (
        <Pressable
          onPress={openAndroidPicker}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${formatDate(toDateOnly(value), locale)}`}
          className={`min-h-12 flex-row items-center gap-2.5 rounded-2xl bg-secondary px-3.5 ${error ? "border border-destructive/40" : ""}`}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text className="flex-1 text-base">{formatDate(toDateOnly(value), locale)}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {error ? (
        <FormControlError>
          <FormControlErrorText>{error}</FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}

export default DatePickerField;
