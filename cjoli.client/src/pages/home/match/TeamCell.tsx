import { Badge } from "react-bootstrap";
import TeamName from "../../../components/TeamName";

const TeamCell = ({
  positionId,
  forfeit,
}: {
  positionId: number;
  forfeit: boolean;
}) => {
  return (
    <>
      <TeamName positionId={positionId} />
      {forfeit && (
        <Badge bg="danger" className="mx-2">
          Forfait
        </Badge>
      )}
    </>
  );
};

export default TeamCell;
