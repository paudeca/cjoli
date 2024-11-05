import { TeamData } from "./TeamData";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  fullName: string;
  logo?: string;
  youngest?: string;
  datas?: TeamData;
  alias?: string;
  primaryColor?: string;
  secondaryColor?: string;
}
