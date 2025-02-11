import { BetScore } from "./BetScore";
import { User } from "./User";

export interface Bet {
  scores: BetScore[];
  history: Record<number, BetScore[]>;
  users: User[];
}
