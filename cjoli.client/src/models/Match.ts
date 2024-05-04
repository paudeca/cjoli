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
  squadId: number;
  phaseId: number;
  userMatch?: UserMatch;
}
