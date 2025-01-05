import { Table, Accordion } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import Loading from "../../components/Loading";
import { Match, Phase } from "../../models";
import dayjs from "dayjs";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import MatchRow from "./match/MatchRow";
import { useParams } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch";
import { memo, useCallback, useEffect, useMemo } from "react";

interface MatchesStackProps extends JSX.IntrinsicAttributes {
  phase: Phase;
}
const MatchesStack = ({ phase }: MatchesStackProps) => {
  const { matches, daySelected, selectDay } = useCJoli();
  const uid = useUid();
  const { squadId } = useParams();

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
      selectDay(keys[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, selectDay]);

  const upperFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const { saveMatch, clearMatch, register } = useMatch(uid);

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
                const datasOrder = datas[key];
                const map = datasOrder.reduce<Record<string, Match[]>>(
                  (acc, m) => {
                    const key = dayjs(m.time).format("LT");
                    return { ...acc, [key]: [...(acc[key] || []), m] };
                  },
                  {}
                );
                return (
                  <Accordion.Item key={index} eventKey={key} data-testid={key}>
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
    </CJoliStack>
  );
};

export const MatchesStackMemo = memo(MatchesStack);
export default MatchesStack;
