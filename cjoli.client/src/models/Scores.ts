import { Score } from "./Score";
import { ScoreSquad } from "./ScoreSquad";

export interface Scores {
  scoreSquads: ScoreSquad[];
  scoreTeams: Record<number, Score>;
}
