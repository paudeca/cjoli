import { Element } from "react-scroll";
import { useCJoli } from "../../../hooks/useCJoli";
import { useMatchRow } from "./useMatchRow";
import CompareButton from "./CompareButton";
import dayjs from "dayjs";
import SimulationIcon from "../../../components/SimulationIcon";
import { useUser } from "../../../hooks/useUser";
import ScoreButton from "./ScoreButton";
import { useTranslation } from "react-i18next";
import ScoreCellInput from "./ScoreCellInput";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { Col, Row, Stack } from "react-bootstrap";
import { BracesAsterisk } from "react-bootstrap-icons";
import TeamCell from "./TeamCell";
import { MyScoreDiv } from "./MatchRow";
import BetScore from "./BetScore";
import ScoreMatchView from "./ScoreMatchView";

const TitleMobile = () => {
  const { getSquad } = useCJoli();
  const { match, teamA, teamB, isSimulation } = useMatchRow();
  const squad = getSquad(match.squadId);
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={2}>
        <Element name={`match-${match.id}`}>
          {teamA && teamB && (
            <CompareButton team={teamA} teamB={teamB} squad={squad} />
          )}
          {dayjs(match.time).format("LT")} -{" "}
          {!match.isEvent
            ? squad?.name
            : t("event.friendly", "🤝 Friendly match")}
          {match.location && ` - ${match.location}`}
          {!match.done && <SimulationIcon show={isSimulation} />}
          <BetScore match={match} />
        </Element>
      </td>
    </tr>
  );
};

const CellViewMobile = () => {
  const { isConnected, isAdmin } = useUser();
  const { match, imatch, clearMatch, isSimulation, modeCast } = useMatchRow();
  const couldDelete =
    !modeCast && (isAdmin || (isConnected && isSimulation && !match.done));
  return (
    <td>
      <MyScoreDiv isMobile>
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

const CellInputMobile = () => {
  const { isConnected, isAdmin } = useUser();
  const { t } = useTranslation();
  const { saveMatch, updateMatch, register, match, modeCast } = useMatchRow();
  const editMode =
    !modeCast &&
    (isAdmin ||
      (isConnected &&
        !match.isEvent &&
        match.time > dayjs().format("YYYY-MM-DDTHH:mm:ss")));
  return (
    <td>
      <MyScoreDiv isMobile>
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
        {!editMode && (
          <CJoliTooltip info={t("match.simulated", "Simulated result")}>
            <Stack style={{ color: "#aaaaaa" }}>
              <Row>
                <Col>{!modeCast ? match.estimate?.scoreA : 0}</Col>
              </Row>
              <Row>
                <Col>{!modeCast ? match.estimate?.scoreB : 0}</Col>
              </Row>
              {!modeCast && (
                <Row>
                  <Col>
                    <BracesAsterisk size={10} />
                  </Col>
                </Row>
              )}
            </Stack>
          </CJoliTooltip>
        )}
      </MyScoreDiv>
    </td>
  );
};

const MatchRowMobile = () => {
  const { match, imatch, done } = useMatchRow();
  return (
    <>
      <TitleMobile />
      <tr data-testid={`match-${match.id}`}>
        <td>
          <Row>
            <Col style={{ textAlign: "left" }}>
              <TeamCell
                positionId={match.positionIdA}
                forfeit={imatch.forfeitA}
                penalty={match.penaltyA}
              />
            </Col>
          </Row>
          <Row>
            <Col style={{ textAlign: "left" }}>
              <TeamCell
                positionId={match.positionIdB}
                forfeit={imatch.forfeitB}
                penalty={match.penaltyB}
              />
            </Col>
          </Row>
        </td>
        {!done && <CellInputMobile />}
        {done && <CellViewMobile />}
      </tr>
    </>
  );
};

export default MatchRowMobile;
