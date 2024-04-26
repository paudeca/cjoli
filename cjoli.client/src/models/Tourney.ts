import { Phase } from "./Phase";
import { Team } from "./Team";

export interface Tourney {
  id: number;
  uid: string;
  name: string;
  phases: Phase[];
  teams: Team[];
}
