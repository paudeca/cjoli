import { Match } from "./Match";
import { Position } from "./Position";

export interface Squad {
  id: number;
  name: string;
  positions: Position[];
  matches: Match[];
  order: number;
}
