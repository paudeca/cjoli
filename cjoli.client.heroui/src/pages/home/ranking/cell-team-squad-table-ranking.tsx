import { InfoPopover } from "@/components/popovers";
import { SimulPopover } from "@/components/popovers/simul-popover";
import { TeamButton } from "@/components/buttons";
import { TeamName } from "@/components/team-name";
import { Score, Squad, useCJoli, useUser } from "@cjoli/core";
import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";

export const CellTeamSquadTableRanking: FC<{ score: Score; squad: Squad }> = ({
  score,
  squad,
}) => {
  const { getPosition, getTeam, getTeamInfo } = useCJoli();
  const { userConfig } = useUser();
  const { t } = useTranslation();

  const position = getPosition(score.positionId);
  const team = getTeam(position?.teamId || 0);

  const userMatches = squad.matches
    .filter(
      (m) =>
        m.userMatch &&
        !m.done &&
        userConfig.useCustomEstimate &&
        (m.positionIdA == score.positionId || m.positionIdB == score.positionId)
    )
    .map((m) => m.userMatch!.id);
  const hasSimulation = userMatches.length > 0;
  const { name } = getTeamInfo(score.positionId);

  const handleRemove = useCallback(
    (ids: number[]) => async () => {
      console.log("ids", ids);
      //const ranking = await cjoliService.clearSimulations(uid, ids);
      //loadRanking(ranking);
    },
    []
  );

  return (
    <div className="flex justify-between">
      <div className="text-left items-center inline-flex min-w-[70%]">
        <TeamName positionId={score.positionId} />
        {hasSimulation && (
          <SimulPopover
            title={`${t("rank.simulation", "Simulation")} - ${name}`}
            onRemove={handleRemove(userMatches)}
          />
        )}
        {team && <TeamButton team={team} />}
      </div>
      <div className="">
        <InfoPopover score={score} squad={squad} />
      </div>
    </div>
  );
};
