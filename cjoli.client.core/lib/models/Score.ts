import { ScoreSource } from "./ScoreSource";

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
  rank: number;
  ranks: Record<
    string,
    {
      rank: number;
      max: number;
      min: number;
      maxRatio: number;
      minRatio: number;
    }
  >;
  sources: Record<number, ScoreSource>;
}
