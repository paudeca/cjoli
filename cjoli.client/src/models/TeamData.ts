import { Player } from "./Player";

export interface TeamData {
  penalty: number;
  logo?: string;
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  players: Player[];
}
