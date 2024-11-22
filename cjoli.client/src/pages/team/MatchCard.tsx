import { Card, Stack } from "react-bootstrap";
import { Match } from "../../models";
import dayjs from "dayjs";
import TeamName from "../../components/TeamName";
import ScoreCellView from "../home/match/ScoreCellView";

interface MatchCardProps {
  match: Match;
}
const MatchCard = ({ match }: MatchCardProps) => {
  return (
    <Card>
      <Card.Header> {dayjs(match.time).format("dddd LL LT")}</Card.Header>
      <Card.Body>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdA} />
          <div className="ms-auto">
            {match.done && <ScoreCellView match={match} mode="A" />}
            {!match.done && <div>-</div>}
          </div>
        </Stack>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdB} />
          <div className="ms-auto">
            {match.done && <ScoreCellView match={match} mode="B" />}
            {!match.done && <div>-</div>}
          </div>
        </Stack>
      </Card.Body>
      <Card.Footer className="text-muted">{match.location}</Card.Footer>
    </Card>
  );
};

export default MatchCard;
