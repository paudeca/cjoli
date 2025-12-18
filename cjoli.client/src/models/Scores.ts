import { Bet } from "./Bet";
import { Score } from "./Score";
import { ScoreSquad } from "./ScoreSquad";

export interface Scores {
  scoreSquads: ScoreSquad[];
  scorePhases: Record<number, Score[]>;
  scoreTeams: Record<number, Score>;
  scoreTeamsSeason: Record<number, Score>;
  scoreTeamsAllTime: Record<number, Score>;
  scoreTourney: Score;
  scoreSeason: Score;
  scoreAllTime: Score;
  bet: Bet;
}
