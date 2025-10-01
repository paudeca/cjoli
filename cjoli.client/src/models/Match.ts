import { EventPhase } from "./EventPhase";
import { IMatch } from "./IMatch";
import { UserMatch } from "./UserMatch";

export interface BracketType {
  Quarter1?: Match;
  Quarter2?: Match;
  Quarter3?: Match;
  Quarter4?: Match;
  Semi1?: Match;
  Semi2?: Match;
  Semi3?: Match;
  Semi4?: Match;
  Final1?: Match;
  Final2?: Match;
  Final3?: Match;
  Final4?: Match;
}

export const MATCH_TYPES = [
  "Quarter1",
  "Quarter2",
  "Quarter3",
  "Quarter4",
  "Semi1",
  "Semi2",
  "Semi3",
  "Semi4",
  "Final1",
  "Final2",
  "Final3",
  "Final4",
];

export type MatchType =
  | "Quarter1"
  | "Quarter2"
  | "Quarter3"
  | "Quarter4"
  | "Semi1"
  | "Semi2"
  | "Semi3"
  | "Semi4"
  | "Final1"
  | "Final2"
  | "Final3"
  | "Final4";

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
  isEvent?: boolean;
  event?: EventPhase;
  teamIdA: number;
  teamIdB: number;
  winnerA: boolean;
  winnerB: boolean;
  name?: string;
  matchType?: MatchType;
}
