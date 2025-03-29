import { TeamName } from "@/components/team-name";
import { Chip } from "@heroui/react";
import { FC } from "react";
import { Trans } from "react-i18next";

interface TeamCellMatchProps {
  positionId: number;
  forfeit: boolean;
  penalty: number;
}

export const TeamCellMatch: FC<TeamCellMatchProps> = ({
  positionId,
  forfeit,
  penalty,
}) => {
  return (
    <>
      <TeamName positionId={positionId} />
      {forfeit && (
        <Chip
          color="danger"
          size="sm"
          radius="lg"
          variant="bordered"
          className="mx-1"
        >
          <Trans i18nKey="match.forfeit">Forfeit</Trans>
        </Chip>
      )}
      {penalty > 0 && (
        <Chip
          color="warning"
          size="sm"
          radius="lg"
          variant="flat"
          className="mx-1"
        >
          {penalty}P
        </Chip>
      )}
    </>
  );
};
