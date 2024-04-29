import { Card, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";
import RankTable from "./ranking/RankTable";
import { useLocation } from "react-router-dom";
import Loading from "../../components/Loading";

const RankingStack = () => {
  const {
    state: { phases },
  } = useCJoli();
  const { hash } = useLocation();
  console.log("HASH", hash);
  const defaultKey = 1;
  let phase = phases && phases.find((p) => `#${p.id}` == hash);
  if (!phase && phases && phases?.length > 0) {
    phase = phases[0];
  }
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!phases && !!phase}>
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey={`#${defaultKey}`}>
                {phases?.map((phase) => (
                  <Nav.Item key={phase.id}>
                    <Nav.Link href={`#${phase.id}`}>{phase.name}</Nav.Link>
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
