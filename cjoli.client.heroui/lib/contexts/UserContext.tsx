import { UserAction } from "@/actions";
import { UserState } from "@/states";
import { createContext, Dispatch } from "react";

export const UserContext = createContext<{
  state: UserState;
  dispatch: Dispatch<UserAction>;
} | null>(null);
