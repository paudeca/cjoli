import useWebSocket from "react-use-websocket";
import { useConfig, useUid, useUser } from "../hooks";
import { MessageServer } from "../models";
import { useCallback, useEffect } from "react";

export const CJoliServer = () => {
  const { server } = useConfig();
  const uid = useUid();
  const { setCountUser } = useUser();

  const { sendJsonMessage: sendMessage, lastJsonMessage: lastMessage } =
    useWebSocket<MessageServer>(`${server}/server/ws`, {
      share: true,
      shouldReconnect: () => true,
      reconnectAttempts: 100,
      reconnectInterval: (count: number) =>
        Math.min(Math.pow(2, count) * 1000, 60000), //max 60s interval
      onOpen: () => {
        if (uid) {
          sendMessage({ type: "selectTourney", uid });
        }
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

  useEffect(() => {
    register("users", (value) => {
      setCountUser(value);
    });
  }, [register, setCountUser]);

  return null;
};
