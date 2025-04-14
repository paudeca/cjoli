import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { useCJoli, useConfig, useUid, useUser } from "@cjoli/core";

export const useNavbarDefault = () => {
  const { tourney, teams } = useCJoli();
  const { userConfig, isConnected } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getPath } = useConfig();
  const uid = useUid();

  const logo = useMemo(() => {
    const team = teams?.find((t) => t.id == userConfig.favoriteTeamId);
    const logo = team?.logo ?? "/logo.png";
    return logo;
  }, [teams, userConfig.favoriteTeamId]);

  const tourneyLabel = uid && tourney?.name;

  const label = useMemo(
    () => ({
      large: tourneyLabel ?? `${t("title", "Ice Hockey")}`,
      small: tourneyLabel ?? "Ice Hockey",
    }),
    [t, tourneyLabel]
  );

  const goTo = useCallback(
    (path: string) => {
      navigate(getPath(path));
    },
    [getPath, navigate]
  );

  const navs = useMemo(
    () =>
      uid
        ? [
            { id: "home", label: t("menu.home", "Home"), path: "/" },
            {
              id: "ranking",
              label: t("menu.ranking", "Ranking"),
              path: "/ranking",
            },
            {
              id: "gallery",
              label: t("menu.gallery", "Photos"),
              path: "/gallery",
            },
            {
              id: "cast",
              label: t("menu.cast", "Slideshow"),
              path: "/cast",
            },
            {
              id: "setting",
              label: t("menu.setting", "Setting"),
              path: "/setting",
            },
          ]
        : [],
    [t, uid]
  );

  return { label, navs, goTo, isConnected, logo };
};
