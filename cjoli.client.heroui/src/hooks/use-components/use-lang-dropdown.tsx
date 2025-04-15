import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import dayjs from "dayjs";

const langs = ["en", "fr", "pt", "es", "de", "nl"];

export const useLangDropdown = () => {
  const { i18n } = useTranslation();

  const [lang, setLang] = useState(i18n.resolvedLanguage);
  const saveLang = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      setLang(lang);
      dayjs.locale(lang);
    },
    [i18n]
  );

  return { langs, lang, saveLang };
};
