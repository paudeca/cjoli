import { Table, Accordion } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import Loading from "../../components/Loading";
import { Match, Phase } from "../../models";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import * as cjoliService from "../../services/cjoliService";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import MatchRow from "./match/MatchRow";
import InfoModal from "../../components/InfoModal";
import { useParams } from "react-router-dom";
import { useModal } from "../../hooks/useModal";
import { Trans, useTranslation } from "react-i18next";
import { memo, useCallback, useEffect, useMemo } from "react";

const MatchesStack = ({ phase }: { phase: Phase }) => {
  const { matches, loadRanking, daySelected, selectDay } = useCJoli();
  const uid = useUid();
  const { register, getValues } =
    useForm<Record<string, { scoreA: number | ""; scoreB: number | "" }>>();
  const { setShow } = useModal("blockShot");
  const { squadId } = useParams();
  const { t } = useTranslation();

  const filter = useCallback(
    (match: Match) =>
      match.phaseId == phase.id &&
      (!squadId || parseInt(squadId) == match.squadId),
    [phase, squadId]
  );

  const datas = useMemo(() => {
    const matchesFiltered = matches.filter(filter);

    const datas = matchesFiltered.reduce<Record<string, Match[]>>((acc, m) => {
      const time = dayjs(m.time);
      const date = time.format("YYYY-MM-DD");
      const list = [...(acc[date] || []), m];
      list.sort((a, b) => {
        return a.location && b.location && a.location > b.location ? 1 : -1;
      });
      return { ...acc, [date]: list };
    }, {});
    return datas;
  }, [filter, matches]);

  const matchesNotDone = useMemo(
    () => matches.filter(filter).filter((m) => !m.done),
    [filter, matches]
  );

  const keys = useMemo(() => {
    const keys = Object.keys(datas);
    keys.sort();
    return keys;
  }, [datas]);

  useEffect(() => {
    if (matchesNotDone.length > 0) {
      const time = dayjs(matchesNotDone[0].time);
      const date = time.format("YYYY-MM-DD");
      selectDay(date);
    } else if (keys) {
      keys && selectDay(keys[0]);
    }
  }, [keys, selectDay, datas, matchesNotDone]);

  const upperFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const saveMatch = async (match: Match) => {
    let { scoreA, scoreB } = getValues(`m${match.id}`);
    if (scoreA == "") scoreA = 0;
    if (scoreB == "") scoreB = 0;

    if (match.forfeitA || match.forfeitB) {
      scoreA = 0;
      scoreB = 0;
    }
    if (match.shot && scoreA == scoreB) {
      setShow(true);
      return;
    }
    const ranking = await cjoliService.saveMatch(uid, {
      ...match,
      scoreA,
      scoreB,
    });
    loadRanking(ranking);
  };

  const clearMatch = async (match: Match) => {
    const ranking = await cjoliService.clearMatch(uid, match);
    loadRanking(ranking);
  };

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5" data-testid="matches">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!matches}>
            <Accordion
              activeKey={daySelected}
              onSelect={(e) => {
                selectDay(e as string);
              }}
            >
              {keys.map((key, index) => {
                const datasOrder = datas ? datas[key] : [];
                datasOrder.sort((a, b) =>
                  a.time > b.time ? 1 : a.time == b.time ? 0 : -1
                );
                const map = datasOrder.reduce<Record<string, Match[]>>(
                  (acc, m) => {
                    const key = dayjs(m.time).format("LT");
                    return { ...acc, [key]: [...(acc[key] || []), m] };
                  },
                  {}
                );
                return (
                  <Accordion.Item key={index} eventKey={key}>
                    <Accordion.Header>
                      {upperFirstLetter(dayjs(key).format("dddd LL"))}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table
                        striped
                        bordered
                        hover
                        style={{ textAlign: "center" }}
                      >
                        <tbody>
                          {Object.keys(map).map((k) =>
                            map[k].map((match, i) => {
                              return (
                                <MatchRow
                                  key={match.id}
                                  index={i}
                                  match={match}
                                  rowSpan={map[k].length}
                                  saveMatch={saveMatch}
                                  clearMatch={clearMatch}
                                  register={register}
                                />
                              );
                            })
                          )}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Loading>
        </CJoliCard>
      </div>
      <InfoModal
        id="blockShot"
        title={t("match.blockShot.title", "Save Score")}
        variant="danger"
      >
        <p>
          <Trans i18nKey="match.blockShot.error">
            Unable to record the score.
            <br />
            The match must end in a penalty shootout.
            <br />
            Please indicate a winner.
          </Trans>
        </p>
      </InfoModal>
    </CJoliStack>
  );
};

export const MatchesStackMemo = memo(MatchesStack);
export default MatchesStack;
