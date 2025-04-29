import { Stack } from "expo-router";
import { TamaguiProvider, createTamagui } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";

export default function RootLayout() {
  const config = createTamagui(defaultConfig);
  return (
    <TamaguiProvider config={config}>
      <Stack />
    </TamaguiProvider>
  );
}
