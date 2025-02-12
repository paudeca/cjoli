import { useToast } from "@/hooks";
import { useCJoli, useUser } from "@cjoli/core";
import { Button } from "@heroui/react";
import { FC, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { StarIcon } from "./icons";
import { CJoliImage } from "./CJoliImage";

export const TeamName: FC<{
  positionId?: number;
  teamId?: number;
  defaultName?: string;
  hideFavorite?: boolean;
  short?: boolean;
}> = ({ positionId, teamId, defaultName, hideFavorite, short }) => {
  const { getTeamInfo, getTeam, findTeam } = useCJoli();
  const { name, logo } = positionId
    ? getTeamInfo(positionId, defaultName)
    : getTeam(teamId!) || { name: defaultName };
  const { t } = useTranslation();
  const { userConfig, isConnected, handleSaveUserConfig } = useUser();
  const { toast } = useToast();
  const { teamId: currentTeamId } = useParams();

  const team = positionId
    ? findTeam({ positionId })
    : teamId
      ? getTeam(teamId)
      : undefined;

  const saveFavoriteTeam = useCallback(
    async (teamId?: number) => {
      await handleSaveUserConfig({
        ...userConfig,
        favoriteTeamId: teamId || 0,
      });
      teamId
        ? toast("success", t("user.favoriteSaved", "Favorite team saved"))
        : toast("success", t("user.favoriteRemoved", "Favorite team removed"));
    },
    [handleSaveUserConfig, userConfig, toast, t]
  );

  const isFavorite = team && userConfig.favoriteTeamId == team.id;

  const fullname =
    !short && team?.datas?.name ? `${name} - ${team.datas.name}` : name;

  const isCurrentTeam =
    currentTeamId && team && team.id == parseInt(currentTeamId);

  return (
    <>
      {!hideFavorite && !short && team && isConnected && (
        <Button
          isIconOnly
          className="text-default translate-x-1"
          radius="full"
          variant="light"
          onPress={() => saveFavoriteTeam(!isFavorite ? team.id : 0)}
        >
          <StarIcon
            fill={isFavorite ? "#D1B100" : "none"}
            color={isFavorite ? "#D1B100" : "currentColor"}
          />
        </Button>
      )}
      <CJoliImage src={logo} isZoomed />
      <span
        className={`px-2 ${isCurrentTeam ? "font-semibold text-secondary" : ""}`}
      >
        {fullname}
      </span>
      {!short && team?.datas?.logo && (
        <CJoliImage src={team.datas.logo} isZoomed />
      )}
    </>
  );
};
