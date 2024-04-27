import { Card, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";
import RankTable from "./ranking/RankTable";

const RankingStack = () => {
  const {
    state: { phases },
  } = useCJoli();
  const defaultKey = 1;
  const phase = phases && phases.length > 0 ? phases[0] : undefined;
  return (
    <>
      <CJoliStack gap={0} className='col-md-8 mx-auto mt-5'>
        <div className='p-2'>
          <CJoliCard>
            <Card.Header>
              <Nav variant='tabs' defaultActiveKey={`#${defaultKey}`}>
                {phases?.map((phase) => (
                  <Nav.Item key={phase.id}>
                    <Nav.Link href={`#${phase.id}`}>{phase.name}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Header>
            {phase && <RankTable phase={phase} />}
          </CJoliCard>
        </div>
      </CJoliStack>
    </>
  );
};

export default RankingStack;
