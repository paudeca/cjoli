import { Message } from "./Message";

export interface Gallery {
  page: number;
  total: number;
  totalWaiting: number;
  pageSize: number;
  messages: Message[];
}
