import { Table, Accordion } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import Loading from "../../components/Loading";
import { Match, Phase } from "../../models";
import moment from "moment";
import "moment/dist/locale/fr";
import { useForm } from "react-hook-form";
import * as cjoliService from "../../services/cjoliService";
import { useCJoli } from "../../hooks/useCJoli";
import useUid from "../../hooks/useUid";
import MatchRow from "./match/MatchRow";
import { useUser } from "../../hooks/useUser";

const MatchesStack = ({ phase }: { phase?: Phase }) => {
  const { matches, loadRanking } = useCJoli();
  const { userConfig } = useUser();
  const uid = useUid();
  const values = matches?.reduce(
    (acc, m) => ({
      ...acc,
      [`m${m.id}`]: userConfig.activeSimulation
        ? m.simulation
        : { scoreA: "", scoreB: "" },
    }),
    {}
  );
  const { register, getValues } = useForm<
    Record<string, { scoreA: number | ""; scoreB: number | "" }>
  >({ values });

  const datas = matches
    ?.filter((m) => m.phaseId == phase?.id)
    .reduce<Record<string, Match[]>>((acc, m) => {
      const time = moment(m.time);
      const date = time.format("yyyy-MM-DD");
      return { ...acc, [date]: [...(acc[date] || []), m] };
    }, {});
  const keys = Object.keys(datas || {});
  keys.sort();
  moment.locale("fr");

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
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!matches}>
            <Accordion defaultActiveKey="0">
              {keys.map((key, index) => {
                const datasOrder = datas ? datas[key] : [];
                datasOrder.sort((a, b) =>
                  a.time > b.time ? 1 : a.time == b.time ? 0 : -1
                );
                const map = datasOrder.reduce<Record<string, Match[]>>(
                  (acc, m) => {
                    const key = moment(m.time).format("LT");
                    return { ...acc, [key]: [...(acc[key] || []), m] };
                  },
                  {}
                );
                return (
                  <Accordion.Item key={index} eventKey={index.toString()}>
                    <Accordion.Header>
                      {upperFirstLetter(moment(key).format("dddd LL"))}
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

export default MatchesStack;
