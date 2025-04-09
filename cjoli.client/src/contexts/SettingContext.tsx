import React, { ReactNode } from "react";
import { Match, Phase, Position, Rank, Squad, Tourney } from "../models";
import { Control, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface SettingProps {
  tourney: Tourney;
  phase?: Phase;
  setPhase: (phase?: Phase) => void;
  squad?: Squad;
  setSquad: (squad?: Squad) => void;
  position?: Position;
  setPosition: (position?: Position) => void;
  match?: Match;
  setMatch: (match?: Match) => void;
  rank?: Rank;
  setRank: (rank?: Rank) => void;
  register: UseFormRegister<Tourney>;
  setValue: UseFormSetValue<Tourney>;
  control: Control<Tourney>;
}

export const SettingContext = React.createContext<SettingProps | null>(null);

export const SettingProvider = ({
  tourney,
  register,
  setValue,
  control,
  children,
}: Omit<
  SettingProps,
  "setPhase" | "setSquad" | "setPosition" | "setMatch" | "setRank"
> & {
  children: ReactNode;
}) => {
  const [phase, setPhase] = React.useState<Phase | undefined>(
    tourney.phases.length > 0 ? tourney.phases[0] : undefined
  );
  const [squad, setSquad] = React.useState<Squad | undefined>(phase?.squads[0]);
  const [position, setPosition] = React.useState<Position | undefined>(
    squad?.positions[0]
  );
  const [match, setMatch] = React.useState<Match | undefined>(
    squad?.matches[0]
  );
  const [rank, setRank] = React.useState<Rank | undefined>(tourney.ranks[0]);
  return (
    <SettingContext.Provider
      value={{
        tourney,
        register,
        setValue,
        control,
        position,
        setPosition,
        phase,
        setPhase,
        squad,
        setSquad,
        match,
        setMatch,
        rank,
        setRank,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};
