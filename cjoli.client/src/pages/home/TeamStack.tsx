import { Card, Stack } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import CJoliStack from "../../components/CJoliStack";
import { useParams } from "react-router-dom";
import { useCJoli } from "../../hooks/useCJoli";

const TeamStack = () => {
  const { getTeam } = useCJoli();
  const { teamId } = useParams();
  const team = getTeam(parseInt(teamId!));
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Header>
            <Stack direction="horizontal" gap={5}>
              <Card.Img variant="top" src={team?.logo} style={{ width: 100 }} />
              <Stack>
                <Card.Title className="ms-auto">{team?.name}</Card.Title>
                <Card.Subtitle className="ms-auto mb-2 text-muted">
                  Position : {team?.youngest}
                </Card.Subtitle>
              </Stack>
            </Stack>
          </Card.Header>
          <Card.Body>Hello</Card.Body>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default TeamStack;
