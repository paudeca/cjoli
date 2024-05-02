import { Card, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import RankTable from "./ranking/RankTable";
import Loading from "../../components/Loading";
import { Phase } from "../../models/Phase";
import { useCJoli } from "../../hooks/useCJoli";

const RankingStack = ({ phase }: { phase?: Phase }) => {
  const { phases } = useCJoli();
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Loading ready={!!phases && !!phase}>
            <Card.Header>
              <Nav variant="tabs" defaultActiveKey={`#${phase?.id}`}>
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
