import { useCJoli } from "../contexts/CJoliContext";

const TeamName = ({ positionId }: { positionId: number }) => {
  const { getTeamInfo } = useCJoli();
  const { label, logo } = getTeamInfo(positionId);
  return (
    <>
      <img src={logo} style={{ width: "30px" }} className="mx-2" />
      {label}
    </>
  );
};

export default TeamName;
