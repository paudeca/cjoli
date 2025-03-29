import { Match } from "@/lib/models";
import { createContext, FC, ReactNode } from "react";

interface MatchState {
  saveMatch: (match: Match) => void;
  updateMatch: (match: Match) => void;
  clearMatch: (match: Match) => void;
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
