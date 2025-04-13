import { Table, Accordion } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import Loading from "../../components/Loading";
import { EventPhase, Match, Phase } from "../../models";
import dayjs from "dayjs";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import MatchRow from "./match/MatchRow";
import { useParams } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch";
import { memo, useCallback, useEffect, useMemo } from "react";
import EventRow from "./match/EventRow";

type MatchEvent = (Match | EventPhase) & { type: string; location?: string };

interface MatchesStackProps extends JSX.IntrinsicAttributes {
  phase: Phase;
  modeCast?: boolean;
}
const MatchesStack = ({ phase, modeCast }: MatchesStackProps) => {
  const { matches, daySelected, selectDay, isCastPage, classNamesCast } =
    useCJoli();
  const { events } = phase;
  const uid = useUid();
  const { squadId } = useParams();

  const filter = useCallback(
    (match: Match) =>
      match.phaseId == phase.id &&
      (!squadId || parseInt(squadId) == match.squadId),
    [phase, squadId]
  );

  const filterEvent = useCallback(
    (event: EventPhase) =>
      !squadId ||
      event.positionIds.length == 0 ||
      event.squadIds.includes(parseInt(squadId)),
    [squadId]
  );

  const datas = useMemo(() => {
    const filtered: MatchEvent[] = [
      ...matches.filter(filter).map((m) => ({ ...m, type: "match" })),
      ...events.filter(filterEvent).map((e) => ({ ...e, type: "event" })),
    ];

    const datas = filtered.reduce<Record<string, MatchEvent[]>>((acc, m) => {
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
  }, [filter, filterEvent, matches, events]);

  const keys = useMemo(() => {
    const keys = Object.keys(datas);
    keys.sort();
    return keys;
  }, [datas]);

  useEffect(() => {
    if (keys && keys.length > 0 && !keys.includes(daySelected)) {
      let i = 0;
      while (
        !datas[keys[i]].some((me) => me.type == "match") &&
        i < keys.length
      ) {
        i++;
      }
      selectDay(keys[i]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, selectDay]);

  const upperFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const { saveMatch, updateMatch, clearMatch, register } = useMatch(uid);

  const hasLocation = useMemo(
    () => matches.some((m) => !!m.location),
    [matches]
  );

  return (
    <CJoliStack
      gap={0}
      className={`${isCastPage ? "col-md-10" : "col-md-8"} mx-auto mt-5`}
      data-testid="matches"
    >
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!matches}>
            <Accordion
              activeKey={!modeCast ? daySelected : keys}
              onSelect={(e) => {
                selectDay(e as string);
              }}
              alwaysOpen={modeCast}
            >
              {keys.map((key, index) => {
                const datasOrder = datas[key];
                const map = datasOrder.reduce<Record<string, MatchEvent[]>>(
                  (acc, m) => {
                    const key = dayjs(m.time).format("LT");
                    return { ...acc, [key]: [...(acc[key] || []), m] };
                  },
                  {}
                );
                return (
                  <Accordion.Item key={index} eventKey={key} data-testid={key}>
                    <Accordion.Header>
                      <span className={classNamesCast.table}>
                        {upperFirstLetter(dayjs(key).format("dddd LL"))}
                      </span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table
                        striped
                        bordered
                        hover
                        style={{ textAlign: "center" }}
                        className={classNamesCast.table}
                      >
                        <tbody>
                          {Object.keys(map).map((k) =>
                            map[k].map((me, i) => {
                              if (me.type == "match") {
                                return (
                                  <MatchRow
                                    key={me.id}
                                    index={i}
                                    match={me as Match}
                                    rowSpan={map[k].length}
                                    saveMatch={saveMatch}
                                    updateMatch={updateMatch}
                                    clearMatch={clearMatch}
                                    register={register}
                                    hasLocation={hasLocation}
                                    modeCast={modeCast}
                                  />
                                );
                              } else if (
                                me.type == "event" &&
                                (me as EventPhase).eventType == "Friendly"
                              ) {
                                const event = me as EventPhase;
                                const { scoreA, scoreB, done } = event.datas
                                  ? JSON.parse(event.datas)
                                  : { scoreA: 0, scoreB: 0, done: false };
                                const match = {
                                  isEvent: true,
                                  event,
                                  id: event.id,
                                  time: event.time,
                                  done,
                                  positionIdA: event.positionIds[0],
                                  positionIdB: event.positionIds[1],
                                  squadId: 0,
                                  phaseId: phase.id,
                                  scoreA,
                                  scoreB,
                                } as Match;
                                return (
                                  <MatchRow
                                    key={me.id}
                                    index={i}
                                    match={match}
                                    rowSpan={map[k].length}
                                    saveMatch={saveMatch}
                                    updateMatch={updateMatch}
                                    clearMatch={clearMatch}
                                    register={register}
                                    hasLocation={hasLocation}
                                    modeCast={modeCast}
                                  />
                                );
                              } else {
                                return (
                                  <EventRow
                                    key={me.id}
                                    event={me as EventPhase}
                                    hasLocation={hasLocation}
                                    modeCast={modeCast}
                                  />
                                );
                              }
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
    </CJoliStack>
  );
};

export const MatchesStackMemo = memo(MatchesStack);
export default MatchesStack;
