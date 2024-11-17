import { Row, Col, Badge, Stack } from "react-bootstrap";
import useScreenSize from "../../../hooks/useScreenSize";
import { IMatch, Match } from "../../../models";
import dayjs from "dayjs";
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
import { BracesAsterisk } from "react-bootstrap-icons";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { useTranslation } from "react-i18next";
import { Element } from "react-scroll";

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
  const { t } = useTranslation();

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

  return (
    <>
      {isMobile && (
        <tr>
          <td colSpan={2}>
            <Element name={`match-${match.id}`}>
              {teamA && teamB && (
                <CompareButton
                  team={teamA}
                  teamB={teamB}
                  squad={getSquad(match.squadId)}
                />
              )}
              {dayjs(match.time).format("LT")} - {getSquad(match.squadId).name}
              {match.location && ` - ${match.location}`}
              <SimulationIcon show={isSimulation} />
            </Element>
          </td>
        </tr>
      )}
      <tr>
        {index == 0 && !isMobile && (
          <td rowSpan={rowSpan}>{dayjs(match.time).format("LT")}</td>
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
              {!isConnected && (
                <CJoliTooltip info={t("match.simulated", "Simulated result")}>
                  <Stack style={{ color: "grey" }}>
                    <Row>
                      <Col>{match.estimate?.scoreA}</Col>
                    </Row>
                    <Row>
                      <Col>{match.estimate?.scoreB}</Col>
                    </Row>
                    <Row>
                      <Col>
                        <BracesAsterisk size={10} />
                      </Col>
                    </Row>
                  </Stack>
                </CJoliTooltip>
              )}
            </MyScoreDiv>
          </td>
        )}
        {isMobile && done && (
          <td>
            <MyScoreDiv isMobile={true}>
              <ScoreCellView match={imatch} mode="A" />
              <ScoreCellView match={imatch} mode="B" />
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
              {!isConnected && (
                <CJoliTooltip info={t("match.simulated", "Simulated result")}>
                  <Row style={{ color: "#aaaaaa" }}>
                    <Col>{match.estimate?.scoreA}</Col>
                  </Row>
                </CJoliTooltip>
              )}

              {teamA && teamB && (
                <CompareButton
                  team={teamA}
                  teamB={teamB}
                  squad={getSquad(match.squadId)}
                />
              )}

              {!isConnected && (
                <CJoliTooltip info={t("match.simulated", "Simulated result")}>
                  <Stack direction="horizontal" style={{ color: "#aaaaaa" }}>
                    <Row>
                      <Col>{match.estimate?.scoreB}</Col>
                    </Row>
                    <Row>
                      <Col>
                        <BracesAsterisk size={10} />
                      </Col>
                    </Row>
                  </Stack>
                </CJoliTooltip>
              )}

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
              {teamA && teamB && (
                <CompareButton
                  team={teamA}
                  teamB={teamB}
                  squad={getSquad(match.squadId)}
                />
              )}
              <ScoreCellView match={imatch} mode="A" />
              <Badge
                bg="light"
                text="black"
                style={{ backgroundColor: "rgba(0,0,0,0)" }}
              >
                <b>-</b>
              </Badge>
              <ScoreCellView match={imatch} mode="B" />
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
