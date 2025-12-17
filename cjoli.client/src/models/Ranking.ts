import { Score } from "./Score";
import { Scores } from "./Scores";
import { Team } from "./Team";
import { Tourney } from "./Tourney";

export interface Ranking {
  tourney: Tourney;
  team: Team;
  scores: Scores;
  history: Record<number, Score[]>;
  categories?: string[];
  seasons?: string[];
}
