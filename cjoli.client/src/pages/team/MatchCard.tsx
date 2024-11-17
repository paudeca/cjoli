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
            <ScoreCellView match={match} mode="A" />
          </div>
        </Stack>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdB} />
          <div className="ms-auto">
            <ScoreCellView match={match} mode="B" />
          </div>
        </Stack>
      </Card.Body>
      <Card.Footer className="text-muted">{match.location}</Card.Footer>
    </Card>
  );
};

export default MatchCard;
