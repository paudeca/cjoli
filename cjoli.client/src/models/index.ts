import { Gallery } from "./Gallery";
import { IMatch } from "./IMatch";
import { Tourney } from "./Tourney";
import { TourneyConfig } from "./TourneyConfig";
import { Match } from "./Match";
import { Message } from "./Message";
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
import { EventPhase } from "./EventPhase";

type TypePage =
  | "welcome"
  | "home"
  | "team"
  | "ranking"
  | "setting"
  | "gallery"
  | "cast";

export type {
  Gallery,
  IMatch,
  Tourney,
  TourneyConfig,
  Match,
  Message,
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
  EventPhase,
};
