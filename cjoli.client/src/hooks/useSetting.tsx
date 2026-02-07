import React from "react";
import { SettingContext } from "../contexts/SettingContext";
import { Match, Phase, Position, Rank, Squad, Tourney } from "../models";

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
    [setPosition],
  );

  const selectMatch = React.useCallback(
    (match?: Match) => {
      setMatch(match);
    },
    [setMatch],
  );

  const selectSquad = React.useCallback(
    (squad?: Squad) => {
      setSquad(squad);
      selectPosition(squad?.positions[0]);
      selectMatch(squad?.matches[0]);
    },
    [setSquad, selectPosition, selectMatch],
  );

  const selectPhase = React.useCallback(
    (phase?: Phase) => {
      setPhase(phase);
      selectSquad(phase?.squads[0]);
    },
    [setPhase, selectSquad],
  );
  const selectRank = React.useCallback(
    (rank?: Rank) => {
      setRank(rank);
    },
    [setRank],
  );

  const getType = React.useCallback((position: Position) => {
    switch (position.matchType) {
      case "Normal": {
        return "";
      }
      case "Final": {
        return `(F${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Semi": {
        return `(S${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Quarter": {
        return `(Q${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match8": {
        return `(M8-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match16": {
        return `(M16-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
      case "Match32": {
        return `(M32-${position.matchOrder}${position.winner ? "W" : "L"})`;
      }
    }
    return "";
  }, []);

  const getLabel = React.useCallback(
    (position: Position, tourney: Tourney) => {
      if (position.teamId > 0) {
        return `${position.name || ""} ${getType(position)} [ ${
          tourney.teams.find((t) => t.id == position.teamId)?.name
        } ]`;
      } else {
        return `${position.name} ${getType(position!)}`;
      }
    },
    [getType],
  );

  return {
    ...context,
    selectPhase,
    selectSquad,
    selectPosition,
    selectMatch,
    selectRank,
    getLabel,
  };
};
