export interface MessageServer {
  type: "users" | "estimation";
  value?: number;
  started?: boolean;
}
