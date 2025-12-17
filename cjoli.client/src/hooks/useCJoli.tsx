/* eslint-disable max-lines */
import { useCallback, useContext, useEffect } from "react";
import {
  CJoliContext,
  ModeScoreObject,
  ModeScoreType,
  ModeScoreTypeObject,
} from "../contexts/CJoliContext";
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

  const loadRankingTeam = useCallback(
    (ranking: Ranking) =>
      dispatch({ type: CJoliActions.LOAD_RANKING_TEAM, payload: ranking }),
    [dispatch]
  );

  const loadTeams = useCallback(
    (teams: Team[]) =>
      dispatch({ type: CJoliActions.LOAD_TEAMS, payload: teams }),
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
    (positionId: number, defaultName?: string, useShort = true) => {
      const position = getPosition(positionId);
      if (!position) return { name: defaultName };
      const team = getTeam(position.teamId);
      if (!team) {
        return { name: (defaultName ?? position.name) || "noname" };
      }
      const name =
        position.name && position.short && useShort
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
    (mode: ModeScoreType, team: Team) => {
      switch (mode) {
        case "tourney":
          return state.ranking?.scores.scoreTeams[team.id];
        case "season":
          return state.ranking?.scores.scoreTeamsSeason[team.id];
        case "allTime":
          return state.ranking?.scores.scoreTeamsAllTime[team.id];
      }
    },
    [state.ranking?.scores]
  );

  const getScoreForTeamHome = useCallback(
    (mode: ModeScoreObject, team?: Team) => {
      const merge: (scoreA: Score, scoreB: Score) => Score = (scoreA, scoreB) =>
        ({
          total: scoreA.total + scoreB.total,
          game: scoreA.game + scoreB.game,
          win: scoreA.win + scoreB.win,
          neutral: scoreA.neutral + scoreB.neutral,
          loss: scoreA.loss + scoreB.loss,
          goalFor: scoreA.goalFor + scoreB.goalFor,
          goalAgainst: scoreA.goalAgainst + scoreB.goalAgainst,
          goalDiff: scoreA.goalDiff + scoreB.goalDiff,
          shutOut: scoreA.shutOut + scoreB.shutOut,
          penalty: scoreA.penalty + scoreB.penalty,
          ranks: scoreB.ranks,
        }) as Score;
      let datas = team
        ? state.ranking?.scores.allScoresTeams[team.id]
        : state.ranking?.scores.allScores || [];
      if (!datas) {
        datas = [];
      }
      const score = datas!.reduce(
        (acc, score) => {
          if (mode.seasons?.length == 0 && mode.categories?.length == 0) {
            return merge(acc, score);
          } else if (
            mode.seasons?.length == 0 &&
            mode.categories?.includes(score.category)
          ) {
            return merge(acc, score);
          } else if (
            mode.categories?.length == 0 &&
            mode.seasons?.includes(score.season)
          ) {
            return merge(acc, score);
          } else if (
            mode.seasons?.includes(score.season) &&
            mode.categories?.includes(score.category)
          ) {
            return merge(acc, score);
          }
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
          penalty: 0,
          ranks: {},
        } as Score
      );
      return score;
    },
    [state.ranking?.scores]
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
    (mode: ModeScoreTypeObject) =>
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
    loadRankingTeam,
    loadTourneys,
    loadTourney,
    loadTeams,
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
    getScoreForTeamHome,
    selectDay,
    getScoreFromPosition,
    getScoreFromSquad,
    setColor,
    selectPage,
    selectModeScore,
    isHomePage: state.page == "home",
    isCastPage: state.page == "cast" || state.page == "fullcast",
    isXl: state.page == "fullcast",
    classNamesCast:
      state.page == "fullcast"
        ? { title: "display-1", table: "display-5", padding: "p-3", radar: 24 }
        : { title: undefined, table: undefined, padding: undefined, radar: 12 },
  };
};
