import { IMatch } from "./IMatch";
import { Tourney } from "./Tourney";
import { TourneyConfig } from "./TourneyConfig";
import { Match } from "./Match";
import { MessageServer } from "./MessageServer";
import { ParentPosition } from "./ParentPosition";
import { Phase } from "./Phase";
import { Position } from "./Position";
import { Rank } from "./Rank";
import { Ranking } from "./Ranking";
import { Score } from "./Score";
import { Scores } from "./Scores";
import { ScoreSource } from "./ScoreSource";
import { ScoreSquad } from "./ScoreSquad";
import { Squad } from "./Squad";
import { Team } from "./Team";
import { TeamData } from "./TeamData";
import { User } from "./User";
import { UserConfig } from "./UserConfig";
import { UserMatch } from "./UserMatch";

type TypePage = "welcome" | "home" | "team" | "ranking" | "setting";

export type {
  IMatch,
  Tourney,
  TourneyConfig,
  Match,
  MessageServer,
  ParentPosition,
  Phase,
  Position,
  Rank,
  Ranking,
  Score,
  Scores,
  ScoreSquad,
  ScoreSource,
  Squad,
  Team,
  TeamData,
  TypePage,
  User,
  UserConfig,
  UserMatch,
};
