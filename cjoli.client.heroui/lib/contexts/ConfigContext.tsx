import { ConfigState } from "@/states";
import { createContext } from "react";

export const ConfigContext = createContext<{
  state: ConfigState;
  isLoaded: boolean;
} | null>(null);
