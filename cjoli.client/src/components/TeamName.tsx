import { useCJoli } from "../hooks/useCJoli";

const TeamName = ({
  positionId,
  defaultName,
}: {
  positionId: number;
  defaultName?: string;
}) => {
  const { getTeamInfo } = useCJoli();
  const { label, logo } = getTeamInfo(positionId, defaultName);
  return (
    <>
      <img src={logo} style={{ width: "30px" }} className="mx-2" />
      {label}
    </>
  );
};

export default TeamName;
