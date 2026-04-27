import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { useTheme } from "@/hooks/useTheme";
import { spacing } from "@/constants/theme";

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
        paddingHorizontal: spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    />
  );
}
