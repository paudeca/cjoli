export interface EventPhase {
  id: number;
  name: string;
  time: Date | string;
  positionIds: number[];
  squadIds: number[];
}
