import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend, { HttpBackendOptions } from "i18next-http-backend";

const url = import.meta.env.VITE_API_URL;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: `${url}/locales/{{ns}}-{{lng}}.json`,
    },
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      lookupQuerystring: "lang",
    },
  });

export default i18n;
