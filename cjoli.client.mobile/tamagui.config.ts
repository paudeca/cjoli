import { defaultConfig } from "@tamagui/config/v4";
//import { createTamagui } from "tamagui";

import { color, radius, size, space, themes, zIndex } from "@tamagui/themes";
import { createTamagui, createTokens } from "tamagui";

const tokens = createTokens({
  size,
  space,
  zIndex,
  color,
  radius,
});

const config1 = createTamagui({
  themes,
  tokens,
  // ... see Configuration
});

export const config = createTamagui(defaultConfig);

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
