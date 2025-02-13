import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tourney, useCJoli } from "@cjoli/core";

export const useSelectPage = () => {
  const { tourneys, selectTourney, loaded } = useCJoli("welcome");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const now = dayjs();

  const datas = useMemo(() => {
    const init: {
      key: "live" | "coming" | "past";
      title: string;
      tourneys: Tourney[];
    }[] = [
      {
        key: "live",
        title: t("select.live", "Live"),
        tourneys: [],
      },
      {
        key: "coming",
        title: t("select.coming", "Coming..."),
        tourneys: [],
      },
      {
        key: "past",
        title: t("select.past", "Past"),
        tourneys: [],
      },
    ];
    const groups = (tourneys ?? []).reduce((acc, t) => {
      const index =
        now > dayjs(t.endTime) ? 2 : now < dayjs(t.startTime) ? 1 : 0;
      acc[index].tourneys = [...acc[index].tourneys, t];
      return acc;
    }, init);
    //invert order tourney in future
    groups[1].tourneys.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));

    const datas = groups.filter((group) => group.tourneys.length > 0);
    return datas;
  }, [now, t, tourneys]);

  const goTourney = useCallback(
    (tourney: Tourney) => {
      const uid = tourney.uid;
      selectTourney(tourney);
      navigate(uid);
    },
    [navigate, selectTourney]
  );

  return { datas, goTourney, loaded: loaded.tourneys };
};
