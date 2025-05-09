import { useCallback } from "react";
import useWebSocket from "react-use-websocket";
import { MessageServer } from "../models";
import useUid from "./useUid";

const server = import.meta.env.VITE_API_WS;

export const useServer = () => {
  const uid = useUid();

  const { sendJsonMessage: sendMessage, lastJsonMessage: lastMessage } =
    useWebSocket<MessageServer>(`${server}/server/ws`, {
      share: true,
      shouldReconnect: () => true,
      reconnectAttempts: 100,
      reconnectInterval: (count: number) =>
        Math.min(Math.pow(2, count) * 1000, 60000), //max 60s interval
      onOpen: () => {
        uid && sendMessage({ type: "selectTourney", uid });
      },
    });

  const register = useCallback(
    (type: string, callback: (value: number) => void) => {
      if (lastMessage != null && lastMessage.type == type) {
        callback(lastMessage.value);
      }
    },
    [lastMessage]
  );

  const host = window.location.host;
  const uidDomain = host.split(".")[0];
  const isUseDomain =
    uidDomain &&
    uidDomain != "61c140aa187f" &&
    uidDomain != "www" &&
    uidDomain != "cjoli-hockey" &&
    !uidDomain.startsWith("localhost");
  const path = isUseDomain ? "/" : `/${uid}/`;

  return { register, sendMessage, lastMessage, isUseDomain, path };
};
