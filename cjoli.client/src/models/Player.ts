export interface Player {
  id: number;
  number: number;
  name?: string;
  playerId: number;
  isCaptain: boolean;
  isAssistant: boolean;
  isGoalKeeper: boolean;
  total: number;
  goal: number;
  assist: number;
  penalty: number;
}
