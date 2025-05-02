import { createContext } from "react";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";

export const BootstrapContext = createContext<{
  loaded: boolean;
  sendMessage: SendJsonMessage;
  register: (type: string, callback: () => void) => void;
} | null>(null);
