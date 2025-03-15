import { Badge } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import { Trans } from "react-i18next";
import PenaltyBadge from "../../../components/PenaltyBadge";

const TeamCell = ({
  positionId,
  forfeit,
  penalty,
}: {
  positionId: number;
  forfeit: boolean;
  penalty: number;
}) => {
  return (
    <>
      <TeamName positionId={positionId} />
      {forfeit && (
        <Badge bg="danger" className="mx-2">
          <Trans i18nKey="match.forfeit">Forfeit</Trans>
        </Badge>
      )}
      <PenaltyBadge penalty={penalty} />
    </>
  );
};

export default TeamCell;
