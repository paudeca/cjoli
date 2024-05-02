import React from "react";
import { CJoliContext, CJoliActions } from "../contexts/CJoliContext";
import { Ranking } from "../models/Ranking";

export const useCJoli = () => {
  const ctx = React.useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliProvider>");
  }

  const { state, dispatch } = ctx;
  const loadRanking = React.useCallback(
    (ranking: Ranking) =>
      dispatch({ type: CJoliActions.LOAD_RANKING, payload: ranking }),
    []
  );
  const getSquad = React.useCallback(
    (squadId: number) => state.squads?.find((s) => s.id === squadId),
    [state.squads]
  );
  const getTeam = React.useCallback(
    (teamId: number) => state.teams?.find((t) => t.id === teamId),
    [state.teams]
  );
  const getPosition = React.useCallback(
    (positionId: number) => state.positions?.find((p) => p.id === positionId),
    [state.positions]
  );
  const getTeamInfo = React.useCallback(
    (positionId: number) => {
      const position = getPosition(positionId);
      if (!position)
        throw new Error(`position not found with id:${positionId}`);
      const team = getTeam(position.teamId);
      if (!team) {
        return { label: position.name || "noname" };
      }
      const label = position.name
        ? `${team?.name} - ${position.short}`
        : team?.name || "noname";
      return { label, logo: team?.logo };
    },
    [getPosition, getTeam]
  );

  return { ...state, loadRanking, getSquad, getTeam, getPosition, getTeamInfo };
};
