import { useApi, useCJoli, useUid, useUser } from "@cjoli/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useDefaultLayout = () => {
  const { getUser, getTourneys } = useApi();
  const uid = useUid();
  const { selectTourney } = useCJoli();
  const { countUser } = useUser();

  useQuery(getUser());
  const { data: tourneys, isLoading } = useQuery(getTourneys({}));

  useEffect(() => {
    if (uid && tourneys) {
      selectTourney(tourneys.find((t) => t.uid === uid)!);
    }
    return () => {};
  }, [uid, tourneys, selectTourney]);

  return { countUser, isLoading };
};
