import { Row, Col, Badge } from "react-bootstrap";
import useScreenSize from "../../../hooks/useScreenSize";
import { IMatch, Match } from "../../../models";
import moment from "moment";
import { useCJoli } from "../../../hooks/useCJoli";
import TeamCell from "./TeamCell";
import ScoreCellInput from "./ScoreCellInput";
import { useUser } from "../../../hooks/useUser";
import { FieldValues, UseFormRegister } from "react-hook-form";
import ScoreCellView from "./ScoreCellView";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import styled from "@emotion/styled";
import ScoreButton from "./ScoreButton";
import SimulationIcon from "../../../components/SimulationIcon";
import CompareButton from "./CompareButton";

const MyScoreDiv = styled("div")<{ isMobile: boolean }>`
  display: flex;
  align-items: ${(props) => (props.isMobile ? "flex-end" : "center")};
  justify-content: center;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};
  & svg,
  & .spinner-grow {
    ${(props) =>
      props.isMobile
        ? "margin-top: 0.5rem !important;"
        : "margin-left: 0.5rem !important;"}
  }
`;

interface MatchRowProps {
  match: Match;
  rowSpan: number;
  index: number;
  saveMatch: (match: Match) => Promise<void>;
  clearMatch: (match: Match) => Promise<void>;
  register: UseFormRegister<FieldValues>;
}

const MatchRow = ({
  match,
  rowSpan,
  index,
  saveMatch,
  clearMatch,
  register,
}: MatchRowProps) => {
  const { getSquad, findTeam } = useCJoli();
  const { isMobile } = useScreenSize();
  const { isConnected, isAdmin, userConfig } = useUser();

  const hasUserMatch =
    match.userMatch && (!isAdmin || (isAdmin && userConfig.useCustomEstimate));
  const imatch: IMatch = match.done
    ? match
    : match.userMatch && hasUserMatch
    ? match.userMatch
    : match;
  const done = hasUserMatch || match.done;
  const isSimulation = !!hasUserMatch;
  const teamA = findTeam({ positionId: match.positionIdA });
  const teamB = findTeam({ positionId: match.positionIdB });

  let badgeA =
    imatch.scoreA > imatch.scoreB
      ? "success"
      : imatch.scoreA === imatch.scoreB
      ? "warning"
      : "danger";
  let badgeB =
    imatch.scoreA < imatch.scoreB
      ? "success"
      : imatch.scoreA === imatch.scoreB
      ? "warning"
      : "danger";
  if (imatch.forfeitA) {
    badgeA = "danger";
    badgeB = "success";
  } else if (imatch.forfeitB) {
    badgeB = "danger";
    badgeA = "success";
  }
  const textA = badgeA == "warning" ? "black" : "white";
  const textB = badgeB == "warning" ? "black" : "white";

  return (
    <>
      {isMobile && (
        <tr>
          <td colSpan={2}>
            {teamA && teamB && <CompareButton team={teamA} teamB={teamB} />}
            {moment(match.time).format("LT")} - {getSquad(match.squadId).name}
            {match.location && ` - ${match.location}`}
            <SimulationIcon show={isSimulation} />
          </td>
        </tr>
      )}
      <tr>
        {index == 0 && !isMobile && (
          <td rowSpan={rowSpan}>{moment(match.time).format("LT")}</td>
        )}
        {!isMobile && (
          <td>
            {getSquad(match.squadId).name}
            <SimulationIcon show={isSimulation} />
          </td>
        )}
        {!isMobile && match.location && <td>{match.location}</td>}
        {isMobile && (
          <td>
            <Row>
              <Col style={{ textAlign: "left" }}>
                <TeamCell
                  positionId={match.positionIdA}
                  forfeit={imatch.forfeitA}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ textAlign: "left" }}>
                <TeamCell
                  positionId={match.positionIdB}
                  forfeit={imatch.forfeitB}
                />
              </Col>
            </Row>
          </td>
        )}
        {isMobile && !done && (
          <td>
            <MyScoreDiv isMobile={true}>
              {isConnected && (
                <>
                  <ScoreCellInput
                    id={`m${match.id}.scoreA`}
                    match={match}
                    saveMatch={saveMatch}
                    register={register}
                    teamA
                  />
                  <ScoreCellInput
                    id={`m${match.id}.scoreB`}
                    match={match}
                    saveMatch={saveMatch}
                    register={register}
                    teamB
                  />

                  <ScoreButton action="save" onClick={() => saveMatch(match)} />
                </>
              )}
            </MyScoreDiv>
          </td>
        )}
        {isMobile && done && (
          <td>
            <MyScoreDiv isMobile={true}>
              <ScoreCellView score={imatch.scoreA} bg={badgeA} text={textA} />
              <ScoreCellView score={imatch.scoreB} bg={badgeB} text={textB} />
              {(isAdmin || (isConnected && isSimulation)) && (
                <ScoreButton
                  action="remove"
                  onClick={() => clearMatch(match)}
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && (
          <td>
            <LeftCenterDiv>
              <TeamCell
                positionId={match.positionIdA}
                forfeit={imatch.forfeitA}
              />
            </LeftCenterDiv>
          </td>
        )}
        {!isMobile && !done && (
          <td>
            <MyScoreDiv isMobile={false}>
              {teamA && teamB && <CompareButton team={teamA} teamB={teamB} />}
              {isConnected && (
                <>
                  <ScoreCellInput
                    id={`m${match.id}.scoreA`}
                    match={match}
                    saveMatch={saveMatch}
                    register={register}
                    teamA
                  />
                  <Badge
                    bg="light"
                    text="black"
                    style={{ backgroundColor: "rgba(0,0,0,0)" }}
                  >
                    <b>-</b>
                  </Badge>
                  <ScoreCellInput
                    id={`m${match.id}.scoreB`}
                    match={match}
                    saveMatch={saveMatch}
                    register={register}
                    teamB
                  />
                  <ScoreButton action="save" onClick={() => saveMatch(match)} />
                </>
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && done && (
          <td>
            <MyScoreDiv isMobile={false}>
              {teamA && teamB && <CompareButton team={teamA} teamB={teamB} />}

              <ScoreCellView score={imatch.scoreA} bg={badgeA} text={textA} />
              <Badge
                bg="light"
                text="black"
                style={{ backgroundColor: "rgba(0,0,0,0)" }}
              >
                <b>-</b>
              </Badge>
              <ScoreCellView score={imatch.scoreB} bg={badgeB} text={textB} />
              {(isAdmin || (isConnected && isSimulation)) && (
                <ScoreButton
                  action="remove"
                  onClick={() => clearMatch(match)}
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && (
          <td>
            <LeftCenterDiv>
              <TeamCell
                positionId={match.positionIdB}
                forfeit={imatch.forfeitB}
              />
            </LeftCenterDiv>
          </td>
        )}
      </tr>
    </>
  );
};

export default MatchRow;
