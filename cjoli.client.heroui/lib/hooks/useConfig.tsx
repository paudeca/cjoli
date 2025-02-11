import { ConfigContext } from "@/contexts";
import { useContext } from "react";

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig has to be used within <ConfigProvider>");
  }

  return { ...ctx.state, isLoaded: ctx.isLoaded };
};
