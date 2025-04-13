import { Badge } from "react-bootstrap";
import TeamName from "../../../components/TeamName";
import { Trans } from "react-i18next";
import PenaltyBadge from "../../../components/PenaltyBadge";
import { useCJoli } from "../../../hooks/useCJoli";

const TeamCell = ({
  positionId,
  forfeit,
  penalty,
}: {
  positionId: number;
  forfeit: boolean;
  penalty: number;
}) => {
  const { isCastPage } = useCJoli();
  return (
    <>
      <TeamName positionId={positionId} hideFavorite={isCastPage} />
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
