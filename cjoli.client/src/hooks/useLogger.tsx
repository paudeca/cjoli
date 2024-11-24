import { datadogLogs } from "@datadog/browser-logs";
import { useCallback, useMemo } from "react";
import { useUser } from "./useUser";
import useUid from "./useUid";

const token = import.meta.env.VITE_DATADOG_TOKEN;
const host = import.meta.env.VITE_DATADOG_HOST;

datadogLogs.init({
  clientToken: token,
  site: "datadoghq.eu",
  service: "client",
  forwardErrorsToLogs: true,
  beforeSend: (event) => {
    event.host = host;
    return true;
  },
});

export const useLogger = () => {
  const { user } = useUser();
  const uid = useUid();
  const getProperties = useCallback(
    (data: unknown[]) => ({
      Properties: {
        ...{ data },
        user: user ? user.login : "guest",
        uid,
      },
    }),
    [uid, user]
  );
  const isTest = process.env.TEST == "true";
  return useMemo(() => {
    const log = datadogLogs.logger;
    return {
      debug: (message: string, ...data: unknown[]) => {
        log.debug(message, getProperties(data));
        !isTest && console.debug(message, ...data);
      },
      info: (message: string, ...data: unknown[]) => {
        log.info(message, getProperties(data));
        !isTest && console.info(message, ...data);
      },
      warn: (message: string, ...data: unknown[]) => {
        log.warn(message, getProperties(data));
        console.warn(message, ...data);
      },
      error: (message: string, ...data: unknown[]) => {
        console.error(message, ...data);
      },
    };
  }, [getProperties, isTest]);
};
