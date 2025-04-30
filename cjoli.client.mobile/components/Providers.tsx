import { useColorScheme } from "react-native";
import { TamaguiProvider, type TamaguiProviderProps } from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { config } from "../tamagui.config";
import { CurrentToast } from "./CurrentToast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

export const Providers = ({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) => {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={client}>
      <TamaguiProvider
        config={config}
        defaultTheme={colorScheme === "dark" ? "dark" : "light"}
        {...rest}
      >
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={
            [
              // uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go
              // 'mobile'
            ]
          }
        >
          {children}
          <CurrentToast />
          <ToastViewport top="$8" left={0} right={0} />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
};
