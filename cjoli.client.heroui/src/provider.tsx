import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import {
  BootstrapProvider,
  CJoliProvider,
  ConfigProvider,
  UserProvider,
} from "@cjoli/core";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const url = import.meta.env.VITE_API_URL;
const server = import.meta.env.VITE_API_WS;

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ConfigProvider url={url} server={server}>
        <CJoliProvider>
          <UserProvider>
            <BootstrapProvider>{children}</BootstrapProvider>
          </UserProvider>
        </CJoliProvider>
      </ConfigProvider>
    </HeroUIProvider>
  );
};
