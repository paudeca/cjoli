export interface EventPhase {
  id: number;
  eventType: "Info" | "Resurfacing" | "Lunch" | "Friendly" | "Competition";
  name: string;
  datas?: string;
  time: Date | string;
  positionIds: number[];
  squadIds: number[];
}
