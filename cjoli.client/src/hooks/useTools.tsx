import React from "react";
import moment from "moment";

/*const upperFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};*/

export const useTools = () => {
  const upperFirstLetter = React.useCallback((value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, []);
  const formatDate = React.useCallback(
    (date: Date, opt?: { upper?: boolean }) =>
      opt?.upper || opt == undefined
        ? upperFirstLetter(moment(date).format("dddd LL"))
        : moment(date).format("dddd LL"),
    []
  );
  return { formatDate, upperFirstLetter };
};
