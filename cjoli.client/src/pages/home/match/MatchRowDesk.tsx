import { useTranslation } from "react-i18next";
import { useUser } from "../../../hooks/useUser";
import { useCJoli } from "../../../hooks/useCJoli";
import { useMatchRow } from "./useMatchRow";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { Badge, Col, Row, Stack } from "react-bootstrap";
import CompareButton from "./CompareButton";
import { BracesAsterisk } from "react-bootstrap-icons";
import ScoreCellInput from "./ScoreCellInput";
import ScoreButton from "./ScoreButton";
import dayjs from "dayjs";
import SimulationIcon from "../../../components/SimulationIcon";
import LeftCenterDiv from "../../../components/LeftCenterDiv";
import TeamCell from "./TeamCell";
import { MyScoreDiv } from "./MatchRow";
import BetScore from "./BetScore";
import ScoreMatchView from "./ScoreMatchView";

const CellInputDesk = () => {
  const { isConnected, isAdmin } = useUser();
  const { t } = useTranslation();
  const { getSquad } = useCJoli();
  const { match, saveMatch, updateMatch, register, teamA, teamB, modeCast } =
    useMatchRow();
  const editMode =
    !modeCast &&
    (isAdmin ||
      (isConnected &&
        !match.isEvent &&
        match.time > dayjs().format("YYYY-MM-DDTHH:mm:ss")));

  return (
    <td>
      <MyScoreDiv isMobile={false}>
        {!editMode && !modeCast && (
          <CJoliTooltip info={t("match.simulated", "Simulated result")}>
            <Row style={{ color: "#aaaaaa" }}>
              <Col>{match.estimate?.scoreA}</Col>
            </Row>
          </CJoliTooltip>
        )}

        {teamA && teamB && !modeCast && (
          <CompareButton
            team={teamA}
            teamB={teamB}
            squad={getSquad(match.squadId)}
          />
        )}

        {!editMode && !modeCast && (
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
        {modeCast && <span style={{ color: "#aaaaaa" }}>0 - 0</span>}

        {editMode && (
          <>
            <ScoreCellInput
              id={`m${match.id}.scoreA`}
              match={match}
              saveMatch={saveMatch}
              updateMatch={updateMatch}
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
              updateMatch={updateMatch}
              register={register}
              teamB
            />
            <ScoreButton
              id={`btn-m${match.id}`}
              action="save"
              onClick={() => saveMatch(match)}
            />
          </>
        )}
      </MyScoreDiv>
    </td>
  );
};

const CellViewDesk = () => {
  const { getSquad } = useCJoli();
  const { isConnected, isAdmin } = useUser();
  const { match, imatch, clearMatch, teamA, teamB, isSimulation, modeCast } =
    useMatchRow();
  const couldDelete =
    !modeCast && (isAdmin || (isConnected && isSimulation && !match.done));

  return (
    <td>
      <MyScoreDiv isMobile={false}>
        {teamA && teamB && (
          <CompareButton
            team={teamA}
            teamB={teamB}
            squad={getSquad(match.squadId)}
          />
        )}
        <ScoreMatchView match={imatch} />
        {couldDelete && (
          <ScoreButton
            id={`btn-m${match.id}`}
            action="remove"
            onClick={() => clearMatch(match)}
          />
        )}
      </MyScoreDiv>
    </td>
  );
};

interface MatchRowDeskProps {
  index: number;
  rowSpan: number;
}

const MatchRowDesk = ({ index, rowSpan }: MatchRowDeskProps) => {
  const { getSquad } = useCJoli();
  const { match, imatch, isSimulation, done, hasLocation } = useMatchRow();
  const squad = getSquad(match.squadId);
  const { t } = useTranslation();
  return (
    <tr data-testid={`match-${match.id}`}>
      {index == 0 && (
        <td rowSpan={rowSpan}>{dayjs(match.time).format("LT")}</td>
      )}
      <td>
        <LeftCenterDiv>
          {!match.isEvent
            ? squad?.name
            : t("event.friendly", "🤝 Friendly match")}
          {!match.done && <SimulationIcon show={isSimulation} />}
          <BetScore match={match} />
        </LeftCenterDiv>
      </td>
      {hasLocation && <td>{match.location}</td>}
      <td>
        <LeftCenterDiv>
          <TeamCell
            positionId={match.positionIdA}
            forfeit={imatch.forfeitA}
            penalty={match.penaltyA}
          />
        </LeftCenterDiv>
      </td>
      {!done && <CellInputDesk />}
      {done && <CellViewDesk />}
      <td>
        <LeftCenterDiv>
          <TeamCell
            positionId={match.positionIdB}
            forfeit={imatch.forfeitB}
            penalty={match.penaltyB}
          />
        </LeftCenterDiv>
      </td>
    </tr>
  );
};

export default MatchRowDesk;
