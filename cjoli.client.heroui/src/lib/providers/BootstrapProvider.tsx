import { BootstrapContext } from "@@/contexts";
import { useUser, useConfig, useUid } from "@@/hooks";
import { useCallback, useEffect, useState } from "react";
import i18n from "i18next";
import Backend, { HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";

import "dayjs/locale/fr";
import "dayjs/locale/pt";
import "dayjs/locale/es";
import "dayjs/locale/de";
import useWebSocket from "react-use-websocket";
import { MessageServer } from "../models";

dayjs.locale("fr");

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

export const BootstrapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { url, server } = useConfig();
  const [loaded, setLoaded] = useState(false);
  const uid = useUid();

  useEffect(() => {
    if (!i18n.isInitialized && !i18n.isInitializing) {
      i18n
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init<HttpBackendOptions>(
          {
            backend: {
              loadPath: `${url}/locales/{{ns}}-{{lng}}.json`,
            },
            debug: true,
            fallbackLng: "en",
            interpolation: {
              escapeValue: false,
            },
          },
          () => setLoaded(true)
        );
    }
  }, [url]);

  /*const { sendJsonMessage: sendMessage, lastJsonMessage: lastMessage } =
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
      console.log("Register", type, callback, lastMessage);
      if (lastMessage != null && lastMessage.type == type) {
        console.log("execute callback", type, lastMessage.value);
        callback(lastMessage.value);
      }
    },
    []
  );*/
  const sendMessage = () => {};
  const register = () => {};

  const { setCountUser } = useUser();

  /*useEffect(() => {
    register("users", (value) => {
      setCountUser(value);
    });
  }, [register, setCountUser]);*/

  return (
    <BootstrapContext.Provider value={{ loaded, sendMessage, register }}>
      {children}
    </BootstrapContext.Provider>
  );
};
