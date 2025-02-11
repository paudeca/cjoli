import React, { useState } from "react";
import { ConfigState } from "@/states";
import { ConfigContext } from "@/contexts";
import { useEffect } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { HttpBackendOptions } from "i18next-http-backend";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";

import "dayjs/locale/fr";
import "dayjs/locale/pt";
import "dayjs/locale/es";
import "dayjs/locale/de";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

dayjs.locale("fr");

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ConfigProvider = ({
  children,
  url,
  server,
}: {
  children: React.ReactNode;
} & ConfigState) => {
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

  return (
    <ConfigContext.Provider
      value={{
        state: { url, server },
        isLoaded: loaded,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigContext.Provider>
  );
};
