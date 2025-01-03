import { IMatch } from "./IMatch";

export interface UserMatch extends IMatch {
  id: number;
  betScore: number;
  logTime: Date;
}
