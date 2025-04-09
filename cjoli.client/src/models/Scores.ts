import { Bet } from "./Bet";
import { Score } from "./Score";
import { ScoreSquad } from "./ScoreSquad";

export interface Scores {
  scoreSquads: ScoreSquad[];
  scorePhases: Record<number, Score[]>;
  scoreTeams: Record<number, Score>;
  scoreTourney: Score;
  bet: Bet;
}
