import { EventPhase } from "./EventPhase";
import { Squad } from "./Squad";

export interface Phase {
  id: number;
  name: string;
  squads: Squad[];
  events: EventPhase[];
}
