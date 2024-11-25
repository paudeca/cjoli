import React, { ReactNode } from "react";
import { IMatch, Match, Team } from "../../../models";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface MatchRowProps {
  match: Match;
  imatch: IMatch;
  saveMatch: (match: Match) => Promise<void>;
  clearMatch: (match: Match) => Promise<void>;
  register: UseFormRegister<FieldValues>;
  teamA?: Team;
  teamB?: Team;
  done: boolean;
  isSimulation: boolean;
}

export const MatchRowContext = React.createContext<MatchRowProps | null>(null);

export const MatchRowProvider = ({
  match,
  imatch,
  saveMatch,
  clearMatch,
  register,
  teamA,
  teamB,
  done,
  isSimulation,
  children,
}: MatchRowProps & {
  children: ReactNode;
}) => {
  return (
    <MatchRowContext.Provider
      value={{
        match,
        imatch,
        saveMatch,
        clearMatch,
        register,
        teamA,
        teamB,
        done,
        isSimulation,
      }}
    >
      {children}
    </MatchRowContext.Provider>
  );
};
