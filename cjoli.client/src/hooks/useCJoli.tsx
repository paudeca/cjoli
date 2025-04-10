import { useCallback, useContext, useEffect } from "react";
import { CJoliContext, ModeScoreType } from "../contexts/CJoliContext";
import {
  Gallery,
  Match,
  Phase,
  Rank,
  Ranking,
  Score,
  Squad,
  Team,
  Tourney,
  TypePage,
} from "../models";
import { CJoliActions } from "../contexts/actions";

// eslint-disable-next-line max-lines-per-function
export const useCJoli = (page?: TypePage) => {
  const ctx = useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliProvider>");
  }

  const { state, dispatch } = ctx;
  const loadTourneys = useCallback(
    (tourneys: Tourney[]) =>
      dispatch({ type: CJoliActions.LOAD_TOURNEYS, payload: tourneys }),
    [dispatch]
  );
  const selectTourney = useCallback(
    (tourney: Tourney) =>
      dispatch({ type: CJoliActions.SELECT_TOURNEY, payload: tourney }),
    [dispatch]
  );

  const loadRanking = useCallback(
    (ranking: Ranking) =>
      dispatch({ type: CJoliActions.LOAD_RANKING, payload: ranking }),
    [dispatch]
  );

  const loadTourney = useCallback(
    (tourney: Tourney) =>
      dispatch({ type: CJoliActions.LOAD_TOURNEY, payload: tourney }),
    [dispatch]
  );

  const loadGallery = useCallback(
    (gallery: Gallery) =>
      dispatch({ type: CJoliActions.LOAD_GALLERY, payload: gallery }),
    [dispatch]
  );

  const getSquad = useCallback(
    (squadId: number) => {
      const squad = state.squads?.find((s) => s.id === squadId);
      return squad;
    },
    [state]
  );
  const getTeam = useCallback(
    (teamId: number) => state.teams?.find((t) => t.id === teamId),
    [state.teams]
  );
  const getPosition = useCallback(
    (positionId: number) => state.positions?.find((p) => p.id === positionId),
    [state.positions]
  );
  const findTeam = useCallback(
    ({ positionId }: { positionId?: number }) => {
      if (positionId) {
        const position = getPosition(positionId);
        return position && getTeam(position.teamId);
      }
      return undefined;
    },
    [getPosition, getTeam]
  );
  const getTeamInfo = useCallback(
    (positionId: number, defaultName?: string) => {
      const position = getPosition(positionId);
      if (!position) return { name: defaultName };
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

  const getScoreFromPosition = useCallback(
    (positionId: number, phase: Phase, squad?: Squad) => {
      let scores: Score[];
      if (squad) {
        scores =
          state.ranking?.scores.scoreSquads.find((s) => s.squadId == squad.id)
            ?.scores ?? [];
      } else {
        scores = state.ranking?.scores.scorePhases[phase.id] ?? [];
      }
      return scores.find((s) => s.positionId == positionId);
    },
    [state.ranking]
  );

  const getRankPosition = useCallback(
    (rank: Rank) => {
      const scoreSquad = state.ranking?.scores.scoreSquads.find(
        (s) => s.squadId == rank.squadId
      );
      const score = scoreSquad?.scores[rank.value - 1];
      return score?.positionId;
    },
    [state.ranking]
  );
  const getTeamRank = useCallback(
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

  const isTeamInPhase = useCallback((teamId: number, phase: Phase) => {
    return phase.squads.some((squad) =>
      squad.positions.some((position) => position.teamId == teamId)
    );
  }, []);
  const isTeamInSquad = useCallback((teamId: number, squad: Squad) => {
    return squad.positions.some((position) => position.teamId == teamId);
  }, []);
  const isTeamInMatch = useCallback(
    (teamId: number, match: Match) => {
      return (
        getPosition(match.positionIdA)?.teamId == teamId ||
        getPosition(match.positionIdB)?.teamId == teamId
      );
    },
    [getPosition]
  );

  const getScoreForTeam = useCallback(
    (mode: "tourney" | "season" | "allTime", team: Team) => {
      switch (mode) {
        case "tourney":
          return state.ranking?.scores.scoreTeams[team.id];
        case "season":
          return state.ranking?.scores.scoreTeamsSeason[team.id];
        case "allTime":
          return state.ranking?.scores.scoreTeamsAllTime[team.id];
      }
    },
    [
      state.ranking?.scores.scoreTeams,
      state.ranking?.scores.scoreTeamsSeason,
      state.ranking?.scores.scoreTeamsAllTime,
    ]
  );

  const getScoreFromSquad = useCallback(
    (squad: Squad, team: Team) => {
      const scoreSquad = state.ranking?.scores.scoreSquads.find(
        (s) => s.squadId == squad.id
      );
      return scoreSquad?.scores.find((s) => s.teamId == team.id);
    },
    [state]
  );

  const selectDay = useCallback(
    (day: string) => dispatch({ type: CJoliActions.SELECT_DAY, payload: day }),
    [dispatch]
  );

  const setColor = useCallback(
    (primary: string, secondary: string) =>
      dispatch({
        type: CJoliActions.SET_COLOR,
        payload: { primary, secondary },
      }),
    [dispatch]
  );

  const selectPage = useCallback(
    (page: TypePage) =>
      dispatch({ type: CJoliActions.SELECT_PAGE, payload: page }),
    [dispatch]
  );

  const selectModeScore = useCallback(
    (mode: ModeScoreType) =>
      dispatch({ type: CJoliActions.SELECT_MODESCORE, payload: mode }),
    [dispatch]
  );

  useEffect(() => {
    page && selectPage(page);
  }, [page, selectPage]);

  return {
    ...state,
    loadGallery,
    loadRanking,
    loadTourneys,
    loadTourney,
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
    selectDay,
    getScoreFromPosition,
    getScoreFromSquad,
    setColor,
    selectPage,
    selectModeScore,
    isHomePage: state.page == "home",
    isCastPage: state.page == "cast",
  };
};
