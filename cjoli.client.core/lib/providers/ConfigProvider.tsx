import { FC, ReactNode } from "react";
import { ConfigState } from "@/states";
import { ConfigContext } from "@/contexts";

export const ConfigProvider: FC<{ children: ReactNode } & ConfigState> = ({
  children,
  url,
  server,
}) => {
  return (
    <ConfigContext.Provider value={{ url, server }}>
      {children}
    </ConfigContext.Provider>
  );
};
