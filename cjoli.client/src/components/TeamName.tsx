import { Star, StarFill } from "react-bootstrap-icons";
import { useCJoli } from "../hooks/useCJoli";
import { zoomIcon } from "../styles";
import styled from "@emotion/styled";
import { useUser } from "../hooks/useUser";
import { useTheme } from "@emotion/react";
import { useParams } from "react-router-dom";
import { useColor } from "../hooks/useColor";
import { Team } from "../models";

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

// eslint-disable-next-line complexity
const TeamName = ({
  positionId,
  teamId,
  team,
  defaultName,
  hideFavorite,
  className,
}: {
  positionId?: number;
  teamId?: number;
  team?: Team;
  defaultName?: string;
  hideFavorite?: boolean;
  className?: string;
}) => {
  const { getTeamInfo, getTeam, findTeam, isXl } = useCJoli();
  const { userConfig, saveFavoriteTeam } = useUser();
  const theme = useTheme();
  const { teamId: currentTeamId } = useParams();
  const { isWhite } = useColor();

  if (!team) {
    team = positionId
      ? findTeam({ positionId })
      : teamId
        ? getTeam(teamId)
        : undefined;
  }
  const { name, logo } = positionId
    ? getTeamInfo(positionId, defaultName, false)
    : team || getTeam(teamId!) || { name: defaultName };

  const fullname = team?.datas?.name ? `${name} - ${team.datas.name}` : name;

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
      <span
        className={className}
        style={{
          maxWidth: 150,
          textOverflow: "ellipsis",
          overflow: "hidden",
          display: "inline-block",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
        }}
      >
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
