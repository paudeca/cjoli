import { useCallback } from "react";
import useWebSocket from "react-use-websocket";
import { MessageServer } from "../models";

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

  return { register, sendMessage, lastMessage };
};
