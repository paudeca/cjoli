import { CjoliAccordion } from "@/components";
import { Match, useCJoli, useUid } from "@cjoli/core";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { TableMatch } from "./match/table-match";

export const MatchHome = () => {
  const { matches, daySelected, selectDay } = useCJoli();
  const uid = useUid();
  const { squadId, phaseId } = useParams();

  const filter = useCallback(
    (match: Match) =>
      phaseId &&
      match.phaseId == parseInt(phaseId) &&
      (!squadId || parseInt(squadId) == match.squadId),
    [phaseId, squadId]
  );

  const datas = useMemo(() => {
    const matchesFiltered = matches.filter(filter);

    const datas = matchesFiltered.reduce<Record<string, Match[]>>((acc, m) => {
      const time = dayjs(m.time);
      const date = time.format("YYYY-MM-DD");
      const list = [...(acc[date] || []), m];
      list.sort((a, b) => {
        if (a.time < b.time) return -1;
        else if (a.time > b.time) return 1;
        else if (a.location && b.location && a.location > b.location) return -1;
        else return 1;
      });
      return { ...acc, [date]: list };
    }, {});
    return datas;
  }, [filter, matches]);

  const keys = useMemo(() => {
    const keys = Object.keys(datas);
    keys.sort();
    return keys;
  }, [datas]);

  useEffect(() => {
    if (keys && keys.length > 0 && !keys.includes(daySelected)) {
      ///selectDay(keys[0]);
    }
  }, [keys, selectDay, daySelected]);

  /*const upperFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };*/

  //const { saveMatch, clearMatch, register } = useMatch(uid);

  const items = keys.map((k) => ({ key: k, title: k }));

  return (
    <CjoliAccordion items={items}>
      {(item) => <TableMatch key={item.key} />}
    </CjoliAccordion>
  );
};
