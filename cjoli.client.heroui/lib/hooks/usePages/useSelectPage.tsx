import { useTranslation } from "react-i18next";
import { useCJoli } from "../useCJoli";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Tourney } from "@/models";
import { useNavigate } from "react-router-dom";

export const useSelectPage = () => {
  const { tourneys, selectTourney } = useCJoli("welcome");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const now = dayjs();

  const groups = useMemo(() => {
    const init: {
      type: "live" | "coming" | "past";
      title: string;
      tourneys: Tourney[];
    }[] = [
      {
        type: "live",
        title: t("select.live", "Live"),
        tourneys: [],
      },
      {
        type: "coming",
        title: t("select.coming", "Coming..."),
        tourneys: [],
      },
      {
        type: "past",
        title: t("select.past", "Past"),
        tourneys: [],
      },
    ];
    return (tourneys ?? []).reduce((acc, t) => {
      const index =
        now > dayjs(t.endTime) ? 2 : now < dayjs(t.startTime) ? 1 : 0;
      acc[index].tourneys = [...acc[index].tourneys, t];
      return acc;
    }, init);
  }, [t, now, tourneys]);

  //invert order tourney in future
  groups[1].tourneys.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));

  const datas = groups.filter((group) => group.tourneys.length > 0);

  const goTourney = useCallback(
    (tourney: Tourney) => {
      const uid = tourney.uid;
      selectTourney(tourney);
      navigate(uid);
    },
    [navigate, selectTourney]
  );

  return { datas, goTourney };
};
