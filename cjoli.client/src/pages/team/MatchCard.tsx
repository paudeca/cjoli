import { Card, Stack } from "react-bootstrap";
import { IMatch, Match } from "../../models";
import dayjs from "dayjs";
import TeamName from "../../components/TeamName";
import ScoreCellView from "../home/match/ScoreCellView";
import { useUser } from "../../hooks/useUser";
import SimulationIcon from "../../components/SimulationIcon";

interface MatchCardProps {
  match: Match;
}
const MatchCard = ({ match }: MatchCardProps) => {
  const { isAdmin, userConfig } = useUser();

  const hasUserMatch =
    match.userMatch && (!isAdmin || (isAdmin && userConfig.useCustomEstimate));

  const imatch: IMatch = match.done
    ? match
    : match.userMatch && hasUserMatch
    ? match.userMatch
    : match;
  const done = hasUserMatch || match.done;
  const isSimulation = !!hasUserMatch;

  return (
    <Card>
      <Card.Header>
        {" "}
        <SimulationIcon show={isSimulation} />
        {dayjs(match.time).format("dddd LL LT")}
      </Card.Header>
      <Card.Body>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdA} />
          <div className="ms-auto">
            {done && <ScoreCellView match={imatch} mode="A" />}
            {!done && <div>-</div>}
          </div>
        </Stack>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdB} />
          <div className="ms-auto">
            {done && <ScoreCellView match={imatch} mode="B" />}
            {!done && <div>-</div>}
          </div>
        </Stack>
      </Card.Body>
      <Card.Footer className="text-muted">{match.location}</Card.Footer>
    </Card>
  );
};

export default MatchCard;
