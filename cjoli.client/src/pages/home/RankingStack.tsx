import { Card, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import RankTable from "./ranking/RankTable";
import Loading from "../../components/Loading";
import { Phase } from "../../models";
import { useCJoli } from "../../hooks/useCJoli";
import { useNavigate, useParams } from "react-router-dom";
import useUid from "../../hooks/useUid";

const RankingStack = ({ phase }: { phase?: Phase }) => {
  const { phases, isTeamInPhase, selectDay } = useCJoli();
  const uid = useUid();
  const navigate = useNavigate();
  const { phaseId, squadId, teamId } = useParams();

  const filter = teamId
    ? (phase: Phase) => isTeamInPhase(parseInt(teamId), phase)
    : (phase: Phase) => !squadId || !phaseId || parseInt(phaseId) == phase.id;
  const datas = phases?.filter(filter) || [];

  const handleClick = (phase: Phase) => {
    selectDay("0");
    navigate(
      teamId
        ? `/${uid}/team/${teamId}/phase/${phase.id}`
        : `/${uid}/phase/${phase.id}`
    );
  };

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!phases && !!phase}>
            <Card.Header>
              <Nav variant="underline" activeKey={`${phase?.id}`}>
                {datas.map((phase) => (
                  <Nav.Item key={phase.id}>
                    <Nav.Link onClick={() => handleClick(phase)}>
                      {phase.name}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Header>
            {phase && <RankTable phase={phase} />}
          </Loading>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default RankingStack;
