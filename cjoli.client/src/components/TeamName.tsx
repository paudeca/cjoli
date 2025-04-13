import { Star, StarFill } from "react-bootstrap-icons";
import { useCJoli } from "../hooks/useCJoli";
import { zoomIcon } from "../styles";
import styled from "@emotion/styled";
import { useUser } from "../hooks/useUser";
import React from "react";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import { useParams } from "react-router-dom";
import { useColor } from "../hooks/useColor";

const MyStar = styled(Star)`
  ${zoomIcon}
`;
const MyStarFill = styled(StarFill)`
  ${zoomIcon}
`;

const MyTeam = styled("span")<{ color: string }>`
  font-weight: 600;
  color: ${(props) => props.color};
`;

const TeamName = ({
  positionId,
  teamId,
  defaultName,
  hideFavorite,
}: {
  positionId?: number;
  teamId?: number;
  defaultName?: string;
  hideFavorite?: boolean;
}) => {
  const { getTeamInfo, getTeam, findTeam, isXl } = useCJoli();
  const { userConfig, isConnected, handleSaveUserConfig } = useUser();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const theme = useTheme();
  const { teamId: currentTeamId } = useParams();
  const { isWhite } = useColor();

  const { name, logo } = positionId
    ? getTeamInfo(positionId, defaultName)
    : getTeam(teamId!) || { name: defaultName };

  const team = positionId
    ? findTeam({ positionId })
    : teamId
      ? getTeam(teamId)
      : undefined;

  const fullname = team?.datas?.name ? `${name} - ${team.datas.name}` : name;

  const saveFavoriteTeam = React.useCallback(
    async (teamId?: number) => {
      isConnected &&
        (await handleSaveUserConfig({
          ...userConfig,
          favoriteTeamId: teamId || 0,
        }));
      !isConnected &&
        localStorage.setItem("favoriteTeamId", (teamId || 0) + "");
      teamId
        ? showToast("success", t("user.favoriteSaved", "Favorite team saved"))
        : showToast(
            "success",
            t("user.favoriteRemoved", "Favorite team removed")
          );
    },
    [handleSaveUserConfig, userConfig, showToast, t, isConnected]
  );

  const isCurrentTeam =
    currentTeamId && team && team.id == parseInt(currentTeamId);

  const color = isWhite(theme.colors.primary) ? "black" : theme.colors.primary;
  return (
    <>
      {!hideFavorite &&
        //isConnected &&
        team &&
        userConfig.favoriteTeamId == team.id && (
          <MyStarFill
            color={theme.colors.secondary}
            role="button"
            onClick={() => saveFavoriteTeam(0)}
          />
        )}
      {!hideFavorite &&
        //isConnected &&
        team &&
        userConfig.favoriteTeamId != team.id && (
          <MyStar
            color="grey"
            role="button"
            onClick={() => saveFavoriteTeam(team.id)}
          />
        )}
      <img
        src={logo}
        style={{
          maxWidth: isXl ? "60px" : "30px",
          maxHeight: isXl ? "60px" : "30px",
        }}
        className={isXl ? "mx-3" : "mx-2"}
      />
      <span>
        {isCurrentTeam ? <MyTeam color={color}>{fullname}</MyTeam> : fullname}
      </span>
      {team?.datas?.logo && (
        <img
          src={team.datas.logo}
          style={{ maxWidth: "30px", maxHeight: "30px" }}
          className="mx-2"
        />
      )}
    </>
  );
};

export default TeamName;
