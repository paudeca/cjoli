import { Card, Stack } from "react-bootstrap";
import { IMatch, Match } from "../../models";
import dayjs from "dayjs";
import TeamName from "../../components/TeamName";
import ScoreCellView from "../home/match/ScoreCellView";
import { useUser } from "../../hooks/useUser";
import SimulationIcon from "../../components/SimulationIcon";
import ScoreCellInput from "../home/match/ScoreCellInput";
import { useMatch } from "../../hooks/useMatch";
import useUid from "../../hooks/useUid";
import ScoreButton from "../home/match/ScoreButton";

interface MatchCardProps {
  match: Match;
}
// eslint-disable-next-line complexity
const MatchCard = ({ match }: MatchCardProps) => {
  const { isAdmin, isConnected, userConfig } = useUser();
  const uid = useUid();
  const { saveMatch, updateMatch, clearMatch, register } = useMatch(uid);

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
        <SimulationIcon show={isSimulation} />
        {dayjs(match.time).format("dddd LL LT")}
      </Card.Header>
      <Card.Body>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdA} />
          <div className="ms-auto">
            {done && <ScoreCellView match={imatch} mode="A" />}
            {!done && isConnected && (
              <ScoreCellInput
                id={`m${match.id}.scoreA`}
                match={match}
                saveMatch={saveMatch}
                updateMatch={updateMatch}
                register={register}
                teamA
              />
            )}
            {!done && !isConnected && <div>-</div>}
          </div>
        </Stack>
        <Stack direction="horizontal">
          <TeamName positionId={match.positionIdB} />
          <div className="ms-auto">
            {done && <ScoreCellView match={imatch} mode="B" />}
            {!done && isConnected && (
              <ScoreCellInput
                id={`m${match.id}.scoreB`}
                match={match}
                saveMatch={saveMatch}
                updateMatch={updateMatch}
                register={register}
                teamB
              />
            )}
            {!done && !isConnected && <div>-</div>}
          </div>
        </Stack>
        {isConnected && (
          <Stack>
            <div className="ms-auto">
              {!done && (
                <ScoreButton
                  id={`btn-m${match.id}`}
                  action="save"
                  onClick={() => saveMatch(match)}
                />
              )}
              {done && (
                <ScoreButton
                  id={`btn-m${match.id}`}
                  action="remove"
                  onClick={() => clearMatch(match)}
                />
              )}
            </div>
          </Stack>
        )}
      </Card.Body>
      {match.location && (
        <Card.Footer className="text-muted">{match.location}</Card.Footer>
      )}
    </Card>
  );
};

export default MatchCard;
