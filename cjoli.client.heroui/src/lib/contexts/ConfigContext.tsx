import { ConfigState } from "@@/states";
import { createContext } from "react";

export const ConfigContext = createContext<ConfigState | null>(null);
