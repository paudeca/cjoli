import { useCallback } from "react";
import dayjs from "dayjs";

export const useTools = () => {
  const upperFirstLetter = useCallback((value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, []);
  const formatDate = useCallback(
    (date: Date, opt?: { upper?: boolean }) =>
      opt?.upper || opt == undefined
        ? upperFirstLetter(dayjs(date).format("dddd LL"))
        : dayjs(date).format("dddd LL"),
    [upperFirstLetter]
  );
  return { formatDate, upperFirstLetter };
};
