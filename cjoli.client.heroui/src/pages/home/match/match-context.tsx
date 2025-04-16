import { Match } from "@/lib/models";
import { UseMutationResult } from "@tanstack/react-query";
import { createContext, FC, ReactNode } from "react";

interface MatchState {
  saveMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  clearMatch: UseMutationResult<any, Error, Match>; //(match: Match) => void;
  hasLocation: boolean;
}

export const MatchContext = createContext<MatchState | null>(null);

export const MatchProvider: FC<MatchState & { children: ReactNode }> = ({
  children,
  ...props
}) => {
  return (
    <MatchContext.Provider value={props}>{children}</MatchContext.Provider>
  );
};
