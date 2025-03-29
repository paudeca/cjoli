import { CjoliAccordion, CJoliModal } from "@/components";
import { Match, useCJoli } from "@cjoli/core";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { TableMatch } from "./match/table-match";
import { useMatch } from "@/lib/hooks/useMatch";
import { Trans, useTranslation } from "react-i18next";
import { FormProvider } from "react-hook-form";
import { MatchProvider } from "./match/match-context";

export const MatchHome = () => {
  const { matches } = useCJoli();
  const { squadId, phaseId } = useParams();
  const { t } = useTranslation();

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
        else if (a.location && b.location && a.location > b.location) return 1;
        else return -1;
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

  const map = useMemo(() => {
    return keys.reduce<Record<string, Record<string, Match[]>>>((acc, k) => {
      const m = datas[k].reduce<Record<string, Match[]>>((acc, m) => {
        const key = dayjs(m.time).format("LT");
        return { ...acc, [key]: [...(acc[key] || []), m] };
      }, {});
      return { ...acc, [k]: m };
    }, {});
  }, [datas, keys]);

  const { saveMatch, updateMatch, clearMatch, form, blockShotModal } =
    useMatch();

  const items = useMemo(() => {
    const upperFirstLetter = (value: string) => {
      return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const today = dayjs().format("YYYY-MM-DD");
    const daySelected = keys.some((k) => k == today) ? today : keys[0];
    return keys.map((k) => ({
      key: k,
      title: upperFirstLetter(dayjs(k).format("dddd LL")),
      defaultExpanded: daySelected == k,
    }));
  }, [keys]);

  return (
    <FormProvider {...form}>
      <MatchProvider
        saveMatch={saveMatch}
        updateMatch={updateMatch}
        clearMatch={clearMatch}
      >
        <CjoliAccordion items={items} mode="single" variant="light" colorHeader>
          {(item) => <TableMatch key={item.key} datas={map[item.key]} />}
        </CjoliAccordion>
        <CJoliModal
          {...blockShotModal}
          title={t("match.blockShot.title", "Save Score")}
        >
          <Trans i18nKey="match.blockShot.error">
            Unable to record the score.
            <br />
            The match must end in a penalty shootout.
            <br />
            Please indicate a winner.
          </Trans>
        </CJoliModal>
      </MatchProvider>
    </FormProvider>
  );
};
