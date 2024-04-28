import { Card, Nav } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useCJoli } from "../../contexts/CJoliContext";
import RankTable from "./ranking/RankTable";
import { useLocation, useNavigate } from "react-router-dom";

const RankingStack = () => {
  const {
    state: { phases },
  } = useCJoli();
  const {hash} = useLocation();
  console.log("HASH",hash);
  const defaultKey = 1;
  let phase = phases && phases.find(p=>`#${p.id}`==hash);
  if(!phase && phases && phases?.length>0) {
    phase = phases[0];
  }
  console.log("Phase",phase);
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
