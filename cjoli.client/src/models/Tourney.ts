import { Message } from "./Message";
import { Phase } from "./Phase";
import { Rank } from "./Rank";
import { Team } from "./Team";
import { TourneyConfig } from "./TourneyConfig";

export interface Tourney {
  id: number;
  uid: string;
  name: string;
  season: string;
  category: string;
  startTime: Date;
  endTime: Date;
  displayTime?: Date;
  phases: Phase[];
  teams: Team[];
  ranks: Rank[];
  rule: string;
  config: TourneyConfig;
  messages: Message[];
  whatsappNumber?: string;
  whatsappNotif?: string;
  tournify?: string;
}
