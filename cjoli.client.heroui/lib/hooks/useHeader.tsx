import { useTranslation } from "react-i18next";
import { useCJoli } from "./useCJoli";
import { useUser } from "./useUser";
import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { useUid } from "./useUid";

const langs = ["en", "fr", "pt", "es", "de"];

export const useHeader = () => {
  const { tourney, teams } = useCJoli();
  const { userConfig } = useUser();
  const { t, i18n } = useTranslation();
  const uid = useUid();

  const tourneyLabel = uid && tourney?.name;
  const team = teams?.find((t) => t.id == userConfig.favoriteTeamId);

  const logo = team?.logo ?? "/logo.png";
  const teamLogo = team?.datas?.logo;
  const getLabel = useCallback(() => {
    return {
      large: tourneyLabel ?? `${t("title", "Ice Hockey")}`,
      small: tourneyLabel ?? "Ice Hockey",
    };
  }, [t, tourneyLabel]);

  const [lang, setLang] = useState(i18n.resolvedLanguage);
  const saveLang = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      setLang(lang);
      dayjs.locale(lang);
    },
    [i18n]
  );

  return { logo, teamLogo, getLabel, langs, lang, saveLang };
};
