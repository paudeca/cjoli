/* eslint-disable complexity */
import { Star, StarFill } from "react-bootstrap-icons";
import { useCJoli } from "../hooks/useCJoli";
import { zoomIcon } from "../styles";
import styled from "@emotion/styled";
import { useUser } from "../hooks/useUser";
import { useTheme } from "@emotion/react";
import { useParams } from "react-router-dom";
import { useColor } from "../hooks/useColor";
import useUid from "../hooks/useUid";
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

interface TeamNameProps {
  positionId?: number;
  teamId?: number;
  team?: Team;
  defaultName?: string;
  hideFavorite?: boolean;
  className?: string;
  xl?: boolean;
}

// eslint-disable-next-line complexity
const TeamName = ({
  positionId,
  teamId,
  team,
  defaultName,
  hideFavorite,
  className,
  xl,
}: TeamNameProps) => {
  const { getTeamInfo, getTeam, findTeam, isXl, getTeamLogo } = useCJoli();
  const { userConfig, saveFavoriteTeam } = useUser();
  const theme = useTheme();
  const { teamId: currentTeamId } = useParams();
  const { isWhite } = useColor();
  const uid = useUid();

  if (!team) {
    team = positionId
      ? findTeam({ positionId })
      : teamId
        ? getTeam(teamId)
        : undefined;
  }
  const { name } = positionId
    ? getTeamInfo(positionId, defaultName, false)
    : team || getTeam(teamId!) || { name: defaultName };

  let fullname = team?.datas?.name ? `${name} ${team.datas.name}` : name;
  if (uid == "cholet2026") {
    fullname = team?.datas?.name ? `${team.datas.name}` : name;
  }

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
        src={getTeamLogo(team)}
        style={{
          maxWidth: xl || isXl ? "60px" : "30px",
          maxHeight: xl || isXl ? "60px" : "30px",
        }}
        className={xl || isXl ? "mx-3" : "mx-2"}
      />
      <span
        className={className}
        style={{
          maxWidth: isXl ? 350 : xl?250:150,
          textOverflow: "ellipsis",
          overflow: "hidden",
          display: "inline-block",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
        }}
      >
        {xl ? (
          <h2>{fullname}</h2>
        ) : isCurrentTeam ? (
          <MyTeam color={color}>{fullname}</MyTeam>
        ) : (
          fullname
        )}
      </span>
      {team?.datas?.logo && uid != "cholet2026" && (
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
