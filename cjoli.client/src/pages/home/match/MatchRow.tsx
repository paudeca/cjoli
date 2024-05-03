import { Row, Col, Badge } from "react-bootstrap";
import useScreenSize from "../../../hooks/useScreenSize";
import { Match } from "../../../models";
import moment from "moment";
import { useCJoli } from "../../../hooks/useCJoli";
import TeamCell from "./TeamCell";
import ScoreCellInput from "./ScoreCellInput";
import { CheckCircle, XCircle } from "react-bootstrap-icons";
import { useUser } from "../../../hooks/useUser";
import { FieldValues, UseFormRegister } from "react-hook-form";
import ScoreCellView from "./ScoreCellView";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import styled from "@emotion/styled";

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

interface MatchRowProps {
  match: Match;
  rowSpan: number;
  index: number;
  saveMatch: (match: Match) => void;
  clearMatch: (match: Match) => void;
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
  const { getSquad } = useCJoli();
  const { isMobile } = useScreenSize();
  const { isAdmin } = useUser();

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
  const textA = badgeA == "warning" ? "black" : "white";
  const textB = badgeB == "warning" ? "black" : "white";

  return (
    <>
      {isMobile && (
        <tr>
          <td colSpan={2}>
            {moment(match.time).format("LT")} - {getSquad(match.squadId)!.name}
          </td>
        </tr>
      )}
      <tr>
        {index == 0 && !isMobile && (
          <td rowSpan={rowSpan}>{moment(match.time).format("LT")}</td>
        )}
        {!isMobile && <td>{getSquad(match.squadId)!.name}</td>}
        {isMobile && (
          <td>
            <Row>
              <Col style={{ textAlign: "left" }}>
                <TeamCell
                  positionId={match.positionIdA}
                  forfeit={match.forfeitA}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ textAlign: "left" }}>
                <TeamCell
                  positionId={match.positionIdB}
                  forfeit={match.forfeitB}
                />
              </Col>
            </Row>
          </td>
        )}
        {isMobile && !match.done && (
          <td>
            <MyScoreDiv isMobile={true}>
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
              {isAdmin && (
                <CheckCircle
                  color="green"
                  size={24}
                  onClick={() => saveMatch(match)}
                  role="button"
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {isMobile && match.done && (
          <td>
            <MyScoreDiv isMobile={true}>
              <ScoreCellView score={match.scoreA} bg={badgeA} text={textA} />
              <ScoreCellView score={match.scoreB} bg={badgeB} text={textB} />
              {isAdmin && (
                <XCircle
                  color="red"
                  size={24}
                  role="button"
                  onClick={() => clearMatch(match)}
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && (
          <td>
            <LeftCenterDiv isMobile={false}>
              <TeamCell
                positionId={match.positionIdA}
                forfeit={match.forfeitA}
              />
            </LeftCenterDiv>
          </td>
        )}
        {!isMobile && !match.done && (
          <td>
            <MyScoreDiv isMobile={false}>
              <ScoreCellInput
                id={`m${match.id}.scoreA`}
                match={match}
                saveMatch={saveMatch}
                register={register}
                teamA
              />
              <Badge bg="light" text="black">
                <b>-</b>
              </Badge>
              <ScoreCellInput
                id={`m${match.id}.scoreB`}
                match={match}
                saveMatch={saveMatch}
                register={register}
                teamB
              />
              {isAdmin && (
                <CheckCircle
                  color="green"
                  size={24}
                  onClick={() => saveMatch(match)}
                  role="button"
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && match.done && (
          <td>
            <MyScoreDiv isMobile={false}>
              <ScoreCellView score={match.scoreA} bg={badgeA} text={textA} />
              <Badge bg="light" text="black">
                <b>-</b>
              </Badge>
              <ScoreCellView score={match.scoreB} bg={badgeB} text={textB} />
              {isAdmin && (
                <XCircle
                  color="red"
                  size={24}
                  role="button"
                  onClick={() => clearMatch(match)}
                />
              )}
            </MyScoreDiv>
          </td>
        )}
        {!isMobile && (
          <td>
            <LeftCenterDiv isMobile={false}>
              <TeamCell
                positionId={match.positionIdB}
                forfeit={match.forfeitB}
              />
            </LeftCenterDiv>
          </td>
        )}
      </tr>
    </>
  );
};

export default MatchRow;
