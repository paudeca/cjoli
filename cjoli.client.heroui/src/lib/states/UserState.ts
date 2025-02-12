import { User } from "@@/models";

export interface UserState {
  user?: User;
  countUser: number;
}
