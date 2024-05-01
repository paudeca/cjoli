import {
  Button,
  Badge,
  Table,
  Accordion,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";
import Loading from "../../components/Loading";
import { Match } from "../../models/Match";
import moment from "moment";
import "moment/dist/locale/fr";
import { Phase } from "../../models/Phase";
import TeamName from "../../components/TeamName";
import LeftCenterDiv from "../../components/LeftCenterDiv";
import useScreenSize from "../../hooks/useScreenSize";
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import * as cjoliService from "../../services/cjoliService";

const MatchesStack = ({ phase }: { phase?: Phase }) => {
  const {
    state: { matches },
    loadRanking,
    getSquad,
  } = useCJoli();
  const { isMobile } = useScreenSize();

  const { register, getValues } = useForm();

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
    const { scoreA, scoreB } = getValues(`m${match.id}`) as {
      scoreA: number;
      scoreB: number;
    };
    const ranking = await cjoliService.saveMatch({ ...match, scoreA, scoreB });
    loadRanking(ranking);
  };

  const clearMatch = async (match: Match) => {
    const ranking = await cjoliService.clearMatch(match);
    loadRanking(ranking);
  };

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!matches}>
            <div className="d-grid gap-2 py-3 m-auto w-25">
              <Button variant="primary">Save</Button>
            </div>

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
                              const badgeA =
                                match.scoreA > match.scoreB
                                  ? "success"
                                  : match.scoreA === match.scoreB
                                  ? "warning"
                                  : "danger";
                              const badgeB =
                                match.scoreA < match.scoreB
                                  ? "success"
                                  : match.scoreA === match.scoreB
                                  ? "warning"
                                  : "danger";
                              const textA =
                                badgeA == "warning" ? "black" : "white";
                              const textB =
                                badgeB == "warning" ? "black" : "white";
                              return (
                                <tr key={match.id}>
                                  {i == 0 && (
                                    <td rowSpan={map[k].length}>
                                      {moment(match.time).format("LT")}
                                    </td>
                                  )}
                                  <td>{getSquad(match.squadId)!.name}</td>
                                  <td>
                                    <LeftCenterDiv>
                                      <TeamName
                                        positionId={match.positionIdA}
                                      />
                                    </LeftCenterDiv>
                                    {isMobile && (
                                      <LeftCenterDiv>
                                        <TeamName
                                          positionId={match.positionIdB}
                                        />
                                      </LeftCenterDiv>
                                    )}
                                  </td>
                                  <td>
                                    {match.done && (
                                      <>
                                        <Badge
                                          bg={badgeA}
                                          text={textA}
                                          style={{ fontSize: "16px" }}
                                        >
                                          {match.scoreA}
                                        </Badge>
                                        {!isMobile && (
                                          <Badge bg="light" text="black">
                                            <b>-</b>
                                          </Badge>
                                        )}
                                        <Badge
                                          bg={badgeB}
                                          text={textB}
                                          style={{ fontSize: "16px" }}
                                        >
                                          {match.scoreB}
                                        </Badge>
                                        <XCircle
                                          color="red"
                                          size={20}
                                          className="mx-2"
                                          role="button"
                                          onClick={() => clearMatch(match)}
                                        />
                                      </>
                                    )}
                                    {!match.done && (
                                      <>
                                        <input
                                          type="number"
                                          min="0"
                                          max="10"
                                          style={{ width: "50px" }}
                                          {...register(`m${match.id}.scoreA`)}
                                        />
                                        {!isMobile && (
                                          <Badge bg="light" text="black">
                                            <b>-</b>
                                          </Badge>
                                        )}
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          style={{ width: "50px" }}
                                          {...register(`m${match.id}.scoreB`)}
                                        />
                                        <CheckCircle
                                          color="green"
                                          size={20}
                                          className="mx-2"
                                          onClick={() => saveMatch(match)}
                                          role="button"
                                        />
                                      </>
                                    )}
                                  </td>
                                  {!isMobile && (
                                    <td>
                                      <LeftCenterDiv>
                                        <TeamName
                                          positionId={match.positionIdB}
                                        />
                                      </LeftCenterDiv>
                                    </td>
                                  )}
                                </tr>
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
            <div className="d-grid gap-2 py-3 m-auto w-25">
              <Button variant="primary">Save</Button>
            </div>
          </Loading>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default MatchesStack;
