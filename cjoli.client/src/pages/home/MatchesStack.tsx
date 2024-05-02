import {
  Badge,
  Table,
  Accordion,
  Form,
  InputGroup,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import Loading from "../../components/Loading";
import { Match, Phase } from "../../models";
import moment from "moment";
import "moment/dist/locale/fr";
import TeamName from "../../components/TeamName";
import LeftCenterDiv from "../../components/LeftCenterDiv";
import useScreenSize from "../../hooks/useScreenSize";
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import * as cjoliService from "../../services/cjoliService";
import styled from "@emotion/styled";
import { useCJoli } from "../../hooks/useCJoli";

const MyScoreDiv = styled("div")<{ isMobile: boolean }>`
  display: flex;
  align-items: ${(props) => (props.isMobile ? "flex-end" : "center")};
  justify-content: center;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};
  & svg {
    ${(props) =>
      props.isMobile
        ? "margin-top: 0.5rem !important;"
        : "margin-left: 0.5rem !important;"}
  }
`;

const MatchesStack = ({ phase }: { phase?: Phase }) => {
  const { matches, loadRanking, getSquad } = useCJoli();
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
    let { scoreA, scoreB } = getValues(`m${match.id}`) as {
      scoreA: number;
      scoreB: number;
    };
    if (match.forfeitA || match.forfeitB) {
      scoreA = 0;
      scoreB = 0;
    }
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
                              let badgeA =
                                match.scoreA > match.scoreB
                                  ? "success"
                                  : match.scoreA === match.scoreB
                                  ? "warning"
                                  : "danger";
                              let badgeB =
                                match.scoreA < match.scoreB
                                  ? "success"
                                  : match.scoreA === match.scoreB
                                  ? "warning"
                                  : "danger";
                              if (match.forfeitA) {
                                badgeA = "danger";
                                badgeB = "success";
                              } else if (match.forfeitB) {
                                badgeB = "danger";
                                badgeA = "success";
                              }
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
                                      {match.forfeitA && (
                                        <Badge bg="danger" className="mx-2">
                                          Forfait
                                        </Badge>
                                      )}
                                    </LeftCenterDiv>
                                    {isMobile && (
                                      <LeftCenterDiv>
                                        <TeamName
                                          positionId={match.positionIdB}
                                        />
                                        {match.forfeitB && (
                                          <Badge bg="danger" className="mx-2">
                                            Forfait
                                          </Badge>
                                        )}
                                      </LeftCenterDiv>
                                    )}
                                  </td>
                                  <td>
                                    {match.done && (
                                      <MyScoreDiv isMobile={isMobile}>
                                        <Badge
                                          bg={badgeA}
                                          text={textA}
                                          style={{ fontSize: "16px" }}
                                          className="my-1"
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
                                          size={24}
                                          role="button"
                                          onClick={() => clearMatch(match)}
                                        />
                                      </MyScoreDiv>
                                    )}
                                    {!match.done && (
                                      <MyScoreDiv isMobile={isMobile}>
                                        <InputGroup
                                          size="sm"
                                          style={{ width: "80px" }}
                                        >
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            max="100"
                                            {...register(`m${match.id}.scoreA`)}
                                          />
                                          <DropdownButton
                                            variant="outline-secondary"
                                            title=""
                                          >
                                            <Dropdown.Item
                                              href="#"
                                              onClick={() =>
                                                saveMatch({
                                                  ...match,
                                                  forfeitA: true,
                                                  forfeitB: false,
                                                  scoreA: 0,
                                                  scoreB: 0,
                                                })
                                              }
                                            >
                                              Forfait
                                            </Dropdown.Item>
                                          </DropdownButton>
                                        </InputGroup>
                                        {!isMobile && (
                                          <Badge bg="light" text="black">
                                            <b>-</b>
                                          </Badge>
                                        )}
                                        <InputGroup
                                          size="sm"
                                          style={{ width: "80px" }}
                                        >
                                          <Form.Control
                                            type="number"
                                            min="0"
                                            max="100"
                                            {...register(`m${match.id}.scoreB`)}
                                          />
                                          <DropdownButton
                                            variant="outline-secondary"
                                            title=""
                                          >
                                            <Dropdown.Item
                                              href="#"
                                              onClick={() =>
                                                saveMatch({
                                                  ...match,
                                                  forfeitB: true,
                                                  forfeitA: false,
                                                  scoreA: 0,
                                                  scoreB: 0,
                                                })
                                              }
                                            >
                                              Forfait
                                            </Dropdown.Item>
                                          </DropdownButton>
                                        </InputGroup>

                                        <CheckCircle
                                          color="green"
                                          size={24}
                                          onClick={() => saveMatch(match)}
                                          role="button"
                                        />
                                      </MyScoreDiv>
                                    )}
                                  </td>
                                  {!isMobile && (
                                    <td>
                                      <LeftCenterDiv>
                                        <TeamName
                                          positionId={match.positionIdB}
                                        />
                                        {match.forfeitB && (
                                          <Badge bg="danger" className="mx-2">
                                            Forfait
                                          </Badge>
                                        )}
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
          </Loading>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default MatchesStack;
