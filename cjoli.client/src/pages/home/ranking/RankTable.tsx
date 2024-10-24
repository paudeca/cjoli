import { Phase, Squad } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import { useParams } from "react-router-dom";
import RankTableSquad from "./RankTableSquad";

const RankTable = ({ phase }: { phase: Phase }) => {
  const { isTeamInSquad } = useCJoli();
  const { squadId, teamId } = useParams();

  const filter = teamId
    ? (squad: Squad) => isTeamInSquad(parseInt(teamId), squad)
    : (squad: Squad) => !squadId || parseInt(squadId) == squad.id;
  const squads = phase.squads.filter(filter);

  return (
    <>
      {squads.map((squad) => (
        <RankTableSquad
          key={squad.id}
          phase={phase}
          squad={squad}
          squads={squads}
        />
      ))}
    </>
  );
};

export default RankTable;
