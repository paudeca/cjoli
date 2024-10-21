import { Star, StarFill } from "react-bootstrap-icons";
import { useCJoli } from "../hooks/useCJoli";
import { zoomIcon } from "../styles";
import styled from "@emotion/styled";
import { useUser } from "../hooks/useUser";
import React from "react";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";

const MyStar = styled(Star)`
  ${zoomIcon}
`;
const MyStarFill = styled(StarFill)`
  ${zoomIcon}
`;

const TeamName = ({
  positionId,
  teamId,
  defaultName,
}: {
  positionId?: number;
  teamId?: number;
  defaultName?: string;
}) => {
  const { getTeamInfo, getTeam, findTeam } = useCJoli();
  const { userConfig, isConnected, handleSaveUserConfig } = useUser();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const { name, logo } = positionId
    ? getTeamInfo(positionId, defaultName)
    : getTeam(teamId!) || { name: defaultName };

  const team = positionId
    ? findTeam({ positionId })
    : teamId
    ? getTeam(teamId)
    : undefined;

  const saveFavoriteTeam = React.useCallback(
    async (teamId?: number) => {
      await handleSaveUserConfig({
        ...userConfig,
        favoriteTeamId: teamId || 0,
      });
      teamId
        ? showToast("success", t("user.favoriteSaved", "Favorite team saved"))
        : showToast(
            "success",
            t("user.favoriteRemoved", "Favorite team removed")
          );
    },
    [handleSaveUserConfig, userConfig, showToast, t]
  );

  return (
    <>
      {isConnected && team && userConfig.favoriteTeamId == team.id && (
        <MyStarFill
          color="#932829"
          role="button"
          onClick={() => saveFavoriteTeam(0)}
        />
      )}
      {isConnected && team && userConfig.favoriteTeamId != team.id && (
        <MyStar
          color="grey"
          role="button"
          onClick={() => saveFavoriteTeam(team.id)}
        />
      )}
      <img
        src={logo}
        style={{ maxWidth: "30px", maxHeight: "30px" }}
        className="mx-2"
      />
      {name}
    </>
  );
};

export default TeamName;
