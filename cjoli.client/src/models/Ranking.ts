import { ScoreSquad } from "./ScoreSquad";
import { Tourney } from "./Tourney";

export interface Ranking {
  tourney: Tourney;
  scores: ScoreSquad[];
}
