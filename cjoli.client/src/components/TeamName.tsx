import { useCJoli } from "../hooks/useCJoli";

const TeamName = ({
  positionId,
  teamId,
  defaultName,
}: {
  positionId?: number;
  teamId?: number;
  defaultName?: string;
}) => {
  const { getTeamInfo, getTeam } = useCJoli();
  const { name, logo } = positionId
    ? getTeamInfo(positionId, defaultName)
    : getTeam(teamId!) || { name: defaultName };
  return (
    <>
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
