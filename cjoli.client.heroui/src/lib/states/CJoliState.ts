import {
  Match,
  Phase,
  Position,
  Ranking,
  Squad,
  Team,
  Tourney,
  TypePage,
} from "../models";

export interface CJoliState {
  tourneys?: Tourney[];
  tourney?: Tourney;
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches: Match[];
  theme: {
    primary: string;
    secondary: string;
  };
  page: TypePage;
  loaded: { tourneys: boolean };
}
