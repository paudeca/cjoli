import { Badge } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import { Trans } from "react-i18next";

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
          <Trans i18nKey="match.forfeit">Forfeit</Trans>
        </Badge>
      )}
    </>
  );
};

export default TeamCell;
