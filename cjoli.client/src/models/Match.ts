import { IMatch } from "./IMatch";
import { UserMatch } from "./UserMatch";

export interface Match extends IMatch {
  id: number;
  done: boolean;
  positionA: number;
  positionIdA: number;
  positionB: number;
  positionIdB: number;
  shot: boolean;
  time: Date | string;
  location?: string;
  squadId: number;
  phaseId: number;
  userMatch?: UserMatch;
  estimate?: { scoreA: number; scoreB: number };
  penaltyA: number;
  penaltyB: number;
}
