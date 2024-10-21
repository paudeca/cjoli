import React from "react";
import { SettingContext } from "../contexts/SettingContext";
import { Match, Phase, Position, Rank, Squad } from "../models";

export const useSetting = () => {
  const ctx = React.useContext(SettingContext);
  if (!ctx) {
    throw new Error("useSetting has to be used within <SettingProvider>");
  }

  const { setPhase, setSquad, setPosition, setMatch, setRank, ...context } =
    ctx;

  const selectPosition = React.useCallback(
    (position?: Position) => {
      setPosition(position);
    },
    [setPosition]
  );

  const selectMatch = React.useCallback(
    (match?: Match) => {
      setMatch(match);
    },
    [setMatch]
  );

  const selectSquad = React.useCallback(
    (squad?: Squad) => {
      setSquad(squad);
      selectPosition(squad?.positions[0]);
      selectMatch(squad?.matches[0]);
    },
    [setSquad, selectPosition, selectMatch]
  );

  const selectPhase = React.useCallback(
    (phase?: Phase) => {
      setPhase(phase);
      selectSquad(phase?.squads[0]);
    },
    [setPhase, selectSquad]
  );
  const selectRank = React.useCallback(
    (rank?: Rank) => {
      setRank(rank);
    },
    [setRank]
  );

  return {
    ...context,
    selectPhase,
    selectSquad,
    selectPosition,
    selectMatch,
    selectRank,
  };
};
