import { User } from "@/models";
import { UserActions } from ".";

export type UserAction =
  | {
      type: UserActions.LOAD_USER;
      payload?: User;
    }
  | { type: UserActions.COUNT_USER; payload: number };
