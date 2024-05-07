import { Phase } from "./Phase";
import { Rank } from "./Rank";
import { Team } from "./Team";

export interface Tourney {
  id: number;
  uid: string;
  name: string;
  phases: Phase[];
  teams: Team[];
  ranks: Rank[];
}
