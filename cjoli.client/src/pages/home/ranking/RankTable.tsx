import { Phase, Squad } from "../../../models";
import { useCJoli } from "../../../hooks/useCJoli";
import { useParams } from "react-router-dom";
import RankTableSquad from "./RankTableSquad";
import RankTableBracket from "./RankTableBracket";
import { Fragment } from "react";

interface RankTableProps {
  phase: Phase;
  displayPhase: boolean;
}

const RankTable = ({ phase, displayPhase }: RankTableProps) => {
  const { isTeamInSquad } = useCJoli();
  const { squadId, teamId } = useParams();

  const filter = teamId
    ? (squad: Squad) => isTeamInSquad(parseInt(teamId), squad)
    : (squad: Squad) => !squadId || parseInt(squadId) == squad.id;
  const squads = phase.squads.filter(filter);
  squads.sort((a, b) => (a.order > b.order ? 1 : -1)); //a.id > b.id ? 1 : -1));

  return (
    <>
      {displayPhase && <RankTableSquad phase={phase} squads={squads} />}

      {!displayPhase &&
        squads.map((squad) => (
          <Fragment key={squad.id}>
            {squad.type == "Bracket" ? (
              <RankTableBracket phase={phase} squad={squad} />
            ) : (
              <RankTableSquad phase={phase} squad={squad} squads={squads} />
            )}
          </Fragment>
        ))}
    </>
  );
};

export default RankTable;
