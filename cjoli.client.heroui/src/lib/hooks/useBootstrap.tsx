import { BootstrapContext } from "@@/contexts";
import { useContext } from "react";

export const useBootstrap = () => {
  const ctx = useContext(BootstrapContext);
  if (!ctx) {
    throw new Error("useBootstrap has to be used within <BootstrapProvider>");
  }

  return { ...ctx };
};
