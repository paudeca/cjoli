import { Squad } from "./Squad";

export interface Phase {
  id: number;
  name: string;
  squads: Squad[];
}
