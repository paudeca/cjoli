import { BootstrapContext } from "@/contexts";
import { useConfig } from "@/hooks";
import { useEffect, useState } from "react";
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

dayjs.locale("fr");

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

export const BootstrapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { url } = useConfig();
  const [loaded, setLoaded] = useState(false);

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

  const sendMessage = () => {};
  const register = () => {};

  return (
    <BootstrapContext.Provider value={{ loaded, sendMessage, register }}>
      {children}
    </BootstrapContext.Provider>
  );
};
