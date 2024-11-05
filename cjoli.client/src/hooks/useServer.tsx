import { useCallback } from "react";
import useWebSocket from "react-use-websocket";
import { MessageServer } from "../models";
import useUid from "./useUid";

const server = import.meta.env.VITE_API_WS;

export const useServer = () => {
  const { sendJsonMessage: sendMessage, lastJsonMessage: lastMessage } =
    useWebSocket<MessageServer>(`${server}/server/ws`, { share: true });

  const register = useCallback(
    (type: string, callback: (value: number) => void) => {
      if (lastMessage != null && lastMessage.type == type) {
        callback(lastMessage.value);
      }
    },
    [lastMessage]
  );

  const uid = useUid();
  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  const isUseDomain =
    uidDomain &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    !uidDomain.startsWith("localhost");
  const path = isUseDomain ? "/" : `/${uid}/`;

  return { register, sendMessage, lastMessage, isUseDomain, path };
};
