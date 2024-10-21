import { ParentPosition } from "./ParentPosition";

export interface Position {
  id: number;
  value: number;
  name?: string;
  short?: string;
  teamId: number;
  squadId: number;
  penalty: number;
  parentPosition?: ParentPosition;
}
