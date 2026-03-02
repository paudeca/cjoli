export interface MatchEvent {
  id: number;
  type: "Start" | "End" | "Goal" | "Penalty" | "GoalKeeper";
  teamId: number;
  time: number;
  playerNum: number;
  assist1Num: number;
  assist2Num: number;
  penalty: string;
  penaltyTime: number;
  goalKeeperInNum: number;
}
