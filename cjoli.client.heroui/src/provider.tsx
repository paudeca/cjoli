import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { BootstrapProvider, ConfigProvider } from "@cjoli/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@cjoli/core";
import { ToastProvider } from "@heroui/react";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const url = import.meta.env.VITE_API_URL;
const server = import.meta.env.VITE_API_WS;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ReduxProvider store={store}>
        <ConfigProvider url={url} server={server}>
          <BootstrapProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </BootstrapProvider>
        </ConfigProvider>
      </ReduxProvider>
      <ToastProvider />
    </HeroUIProvider>
  );
};
