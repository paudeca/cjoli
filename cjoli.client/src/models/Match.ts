export interface Match {
  id: number;
  done: boolean;
  positionA: number;
  positionB: number;
  scoreA: number;
  scoreB: number;
  forfeitA: boolean;
  forfeitB: BooleanConstructor;
  time: Date;
  squadId: number;
}
