export interface Match {
  id: number;
  done: boolean;
  positionA: number;
  positionIdA: number;
  positionB: number;
  positionIdB: number;
  scoreA: number;
  scoreB: number;
  forfeitA: boolean;
  forfeitB: boolean;
  time: Date;
  squadId: number;
  phaseId: number;
}
