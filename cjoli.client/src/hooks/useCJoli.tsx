import React from "react";
import { CJoliContext } from "../contexts/CJoliContext";
import {
  Match,
  Phase,
  Rank,
  Ranking,
  Score,
  Squad,
  Team,
  Tourney,
} from "../models";
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
    (positionId: number, defaultName?: string) => {
      const position = getPosition(positionId);
      if (!position)
        throw new Error(`position not found with id:${positionId}`);
      const team = getTeam(position.teamId);
      if (!team) {
        return { label: (defaultName ?? position.name) || "noname" };
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
      return null;
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

  const getAllScoreForTeam = React.useCallback(
    (team: Team) => {
      const squads =
        state.squads?.filter((s) =>
          s.positions.some((p) => p.teamId == team.id)
        ) || [];
      const positions = squads.map(
        (s) => s.positions.find((p) => p.teamId == team.id)!
      );
      const scores = (state.ranking?.scores || [])
        .filter((s) => squads.map((s) => s.id).includes(s.squadId))
        .map(
          (s) =>
            s.scores.find((s) =>
              positions.map((p) => p.id).includes(s.positionId)
            )!
        );
      return scores.reduce<Score>(
        (acc, score) => {
          acc.total += score.total;
          acc.game += score.game;
          acc.win += score.win;
          acc.neutral += score.neutral;
          acc.loss += score.loss;
          acc.goalFor += score.goalFor;
          acc.goalAgainst += score.goalAgainst;
          acc.goalDiff += score.goalDiff;
          acc.shutOut += score.shutOut;
          return acc;
        },
        {
          total: 0,
          game: 0,
          win: 0,
          neutral: 0,
          loss: 0,
          goalFor: 0,
          goalAgainst: 0,
          goalDiff: 0,
          shutOut: 0,
        } as Score
      );
    },
    [state.squads, state.ranking?.scores]
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
    getTeamRank,
    isTeamInPhase,
    isTeamInSquad,
    isTeamInMatch,
    getAllScoreForTeam,
  };
};
