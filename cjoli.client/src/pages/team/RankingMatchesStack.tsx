import { useMemo } from "react";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { Phase, Team } from "../../models";
import RankTable from "../home/ranking/RankTable";
import { useCJoli } from "../../hooks/useCJoli";
import { Col, Row } from "react-bootstrap";
import MatchCard from "./MatchCard";

interface RankingMatchesStackProps {
  phase: Phase;
  team: Team;
}

const RankingMatchesStack = ({ phase, team }: RankingMatchesStackProps) => {
  const { matches, isTeamInMatch } = useCJoli();
  const filterMatches = useMemo(
    () =>
      matches.filter((m) => m.phaseId == phase.id && isTeamInMatch(team.id, m)),
    []
  );
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5" data-testid="ranking">
      <div className="p-2">
        <CJoliCard style={{ background: "#e7e9ee" }}>
          <RankTable phase={phase} />
          <Row className="m-3">
            {filterMatches.map((m) => (
              <Col key={m.id} lg={4} className="my-3">
                <MatchCard match={m} />
              </Col>
            ))}
          </Row>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default RankingMatchesStack;
