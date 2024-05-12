import React from "react";
import { CJoliContext } from "../contexts/CJoliContext";
import { Match, Phase, Rank, Ranking, Squad, Team, Tourney } from "../models";
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
  const findTeam = React.useCallback(
    ({ positionId }: { positionId?: number }) => {
      if (positionId) {
        const position = getPosition(positionId);
        return position && getTeam(position.teamId);
      }
      return undefined;
    },
    []
  );
  const getPosition = React.useCallback(
    (positionId: number) => state.positions?.find((p) => p.id === positionId),
    [state.positions]
  );
  const getTeamInfo = React.useCallback(
    (positionId: number, defaultName?: string) => {
      const position = getPosition(positionId);
      if (!position)
        throw new Error(`position not found with id:${positionId}`);
      const team = getTeam(position.teamId);
      if (!team) {
        return { name: (defaultName ?? position.name) || "noname" };
      }
      const name = position.name
        ? `${team?.name} - ${position.short}`
        : team?.name || "noname";
      return { name, logo: team?.logo };
    },
    [getPosition, getTeam]
  );

  const getRankPosition = React.useCallback(
    (rank: Rank) => {
      const scoreSquad = state.ranking?.scores.scoreSquads.find(
        (s) => s.squadId == rank.squadId
      );
      const score = scoreSquad?.scores[rank.value - 1];
      return score?.positionId;
    },
    [state.ranking]
  );
  const getTeamRank = React.useCallback(
    (team: Team) => {
      for (const rank of state.tourney?.ranks || []) {
        const positionId = getRankPosition(rank);
        if (!positionId) {
          continue;
        }
        const position = getPosition(positionId);
        if (position?.teamId == team.id) {
          return rank;
        }
      }
      return undefined;
    },
    [getPosition, getRankPosition, state.tourney?.ranks]
  );

  const isTeamInPhase = React.useCallback((teamId: number, phase: Phase) => {
    return phase.squads.some((squad) =>
      squad.positions.some((position) => position.teamId == teamId)
    );
  }, []);
  const isTeamInSquad = React.useCallback((teamId: number, squad: Squad) => {
    return squad.positions.some((position) => position.teamId == teamId);
  }, []);
  const isTeamInMatch = React.useCallback(
    (teamId: number, match: Match) => {
      return (
        getPosition(match.positionIdA)?.teamId == teamId ||
        getPosition(match.positionIdB)?.teamId == teamId
      );
    },
    [getPosition]
  );

  const getScoreForTeam = React.useCallback(
    (team: Team) => {
      return state.ranking?.scores.scoreTeams[team.id];
    },
    [state.ranking?.scores.scoreTeams]
  );

  return {
    ...state,
    loadRanking,
    loadTourneys,
    selectTourney,
    getSquad,
    getTeam,
    findTeam,
    getPosition,
    getTeamInfo,
    getRankPosition,
    getTeamRank,
    isTeamInPhase,
    isTeamInSquad,
    isTeamInMatch,
    getScoreForTeam,
  };
};
