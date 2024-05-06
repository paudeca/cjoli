import { IMatch } from "./IMatch";
import { UserMatch } from "./UserMatch";

export interface Match extends IMatch {
  id: number;
  done: boolean;
  positionA: number;
  positionIdA: number;
  positionB: number;
  positionIdB: number;
  time: Date;
  location?: string;
  squadId: number;
  phaseId: number;
  userMatch?: UserMatch;
  simulation?: { scoreA: number; scoreB: number };
}
