import { Element } from "react-scroll";
import { useCJoli } from "../../../hooks/useCJoli";
import { useMatchRow } from "./useMatchRow";
import CompareButton from "./CompareButton";
import dayjs from "dayjs";
import SimulationIcon from "../../../components/SimulationIcon";
import { useUser } from "../../../hooks/useUser";
import ScoreCellView from "./ScoreCellView";
import ScoreButton from "./ScoreButton";
import { useTranslation } from "react-i18next";
import ScoreCellInput from "./ScoreCellInput";
import CJoliTooltip from "../../../components/CJoliTooltip";
import { Col, Row, Stack } from "react-bootstrap";
import { BracesAsterisk } from "react-bootstrap-icons";
import TeamCell from "./TeamCell";
import { MyScoreDiv } from "./MatchRow";
import BetScore from "./BetScore";

const TitleMobile = () => {
  const { getSquad } = useCJoli();
  const { match, teamA, teamB, isSimulation } = useMatchRow();
  const squad = getSquad(match.squadId);
  return (
    <tr>
      <td colSpan={2}>
        <Element name={`match-${match.id}`}>
          {teamA && teamB && (
            <CompareButton team={teamA} teamB={teamB} squad={squad} />
          )}
          {dayjs(match.time).format("LT")} - {squad?.name}
          {match.location && ` - ${match.location}`}
          <SimulationIcon show={isSimulation} />
          <BetScore match={match} />
        </Element>
      </td>
    </tr>
  );
};

const CellViewMobile = () => {
  const { isConnected, isAdmin } = useUser();
  const { match, imatch, clearMatch, isSimulation } = useMatchRow();
  return (
    <td>
      <MyScoreDiv isMobile>
        <ScoreCellView match={imatch} mode="A" />
        <ScoreCellView match={imatch} mode="B" />
        {(isAdmin || (isConnected && isSimulation)) && (
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
  const { isConnected } = useUser();
  const { t } = useTranslation();
  const { saveMatch, register, match } = useMatchRow();

  return (
    <td>
      <MyScoreDiv isMobile>
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

            <ScoreButton
              id={`btn-m${match.id}`}
              action="save"
              onClick={() => saveMatch(match)}
            />
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
        {!done && <CellInputMobile />}
        {done && <CellViewMobile />}
      </tr>
    </>
  );
};

export default MatchRowMobile;
