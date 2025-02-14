import { useApi, useCJoli, useUid, useUser } from "@cjoli/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

let tourneySelected = false;
export const useDefaultLayout = () => {
  const { getUser, getTourneys } = useApi();
  const uid = useUid();
  const { selectTourney } = useCJoli();
  const { countUser } = useUser();
  const { pathname } = useLocation();

  useQuery(getUser());
  const { data: tourneys, isLoading } = useQuery(getTourneys({}));

  useEffect(() => {
    if (!tourneySelected && uid && tourneys) {
      tourneySelected = true;
      selectTourney(tourneys.find((t) => t.uid === uid)!);
    }
    return () => {};
  }, [uid, tourneys, selectTourney]);

  const page: "home" | "ranking" = useMemo(() => {
    return pathname.endsWith("ranking") ? "ranking" : "home";
  }, [pathname]);

  return { countUser, isLoading, page };
};
