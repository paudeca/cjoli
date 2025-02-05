import { CJoliAction } from "@/actions";
import { CJoliState } from "@/states";
import { createContext, Dispatch } from "react";

export const CJoliContext = createContext<{
  state: CJoliState;
  dispatch: Dispatch<CJoliAction>;
} | null>(null);
