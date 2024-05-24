export interface Score {
  teamId: number;
  positionId: number;
  game: number;
  win: number;
  neutral: number;
  loss: number;
  total: number;
  goalFor: number;
  goalAgainst: number;
  goalDiff: number;
  shutOut: number;
  penalty: number;
  time: Date;
  rank: Record<string, number>;
}
