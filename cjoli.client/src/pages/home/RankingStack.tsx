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
  const { phases } = useCJoli();
  const uid = useUid();
  const navigate = useNavigate();
  const { phaseId, squadId } = useParams();

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!phases && !!phase}>
            <Card.Header>
              <Nav variant="underline" defaultActiveKey={`${phase?.id}`}>
                {phases
                  ?.filter(
                    (p) => !squadId || !phaseId || parseInt(phaseId) == p.id
                  )
                  .map((phase) => (
                    <Nav.Item key={phase.id}>
                      <Nav.Link
                        onClick={() => navigate(`/${uid}/phase/${phase.id}`)}
                      >
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
