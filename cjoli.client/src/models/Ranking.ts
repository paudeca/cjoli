import { Scores } from "./Scores";
import { Tourney } from "./Tourney";

export interface Ranking {
  tourney: Tourney;
  scores: Scores;
}
