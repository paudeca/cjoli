import React from "react";
import { CJoliContext } from "../contexts/CJoliContext";
import { Rank, Ranking, Tourney } from "../models";
import { CJoliActions } from "../contexts/actions";

export const useCJoli = () => {
  const ctx = React.useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliProvider>");
  }

  const { state, dispatch } = ctx;
  const loadTourneys = React.useCallback(
    (tourneys: Tourney[]) =>
      dispatch({ type: CJoliActions.LOAD_TOURNEYS, payload: tourneys }),
    [dispatch]
  );
  const selectTourney = React.useCallback(
    (tourney: Tourney) =>
      dispatch({ type: CJoliActions.SELECT_TOURNEY, payload: tourney }),
    [dispatch]
  );

  const loadRanking = React.useCallback(
    (ranking: Ranking) =>
      dispatch({ type: CJoliActions.LOAD_RANKING, payload: ranking }),
    [dispatch]
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

  const getRankPosition = React.useCallback(
    (rank: Rank) => {
      const scoreSquad = state.ranking?.scores.find(
        (s) => s.squadId == rank.squadId
      );
      const score = scoreSquad?.scores[rank.value - 1];
      return score?.positionId;
    },
    [state.ranking]
  );

  return {
    ...state,
    loadRanking,
    loadTourneys,
    selectTourney,
    getSquad,
    getTeam,
    getPosition,
    getTeamInfo,
    getRankPosition,
  };
};
