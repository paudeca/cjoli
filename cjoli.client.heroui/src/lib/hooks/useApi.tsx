import {
  DefaultError,
  queryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useCjoliService, useSettingService } from "./useServices";
import { useUser } from "./useUser";
import { useCJoli } from "./useCJoli";
import {
  Match,
  Phase,
  Position,
  Rank,
  Squad,
  Team,
  Tourney,
  User,
} from "../models";
import { useNavigate } from "react-router-dom";

export const mutationOptions = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationOptions<TData, TError, TVariables, TContext> => {
  return options;
};

const useApiGet = () => {
  const { loadTourneys, loadRanking } = useCJoli();
  const { loadUser } = useUser();
  const cjoliService = useCjoliService();
  const settingServices = useSettingService();

  const getUser = useCallback(
    () =>
      queryOptions({
        queryKey: ["getUser"],
        queryFn: async () => {
          const user = await cjoliService.getUser();
          loadUser(user);
          return user;
        },
      }),
    [loadUser, cjoliService]
  );

  const listUsers = useCallback(
    () =>
      queryOptions({
        queryKey: ["listUsers"],
        queryFn: async () => {
          const users = await cjoliService.listUsers();
          return users;
        },
      }),
    [cjoliService]
  );

  const getTourneys = useCallback(
    ({ enabled }: { enabled?: boolean }) =>
      queryOptions({
        queryKey: ["getTourneys"],
        queryFn: async () => {
          const tourneys = await cjoliService.getTourneys();
          loadTourneys(tourneys);
          return tourneys;
        },
        enabled,
      }),
    [loadTourneys, cjoliService]
  );

  const getTeams = useCallback(
    () =>
      queryOptions({
        queryKey: ["getTeams"],
        queryFn: async () => await settingServices.getTeams(),
        initialData: [],
        retry: 0,
      }),
    [settingServices]
  );

  const getRanking = useCallback(
    (uid: string) =>
      queryOptions({
        queryKey: ["getRanking", uid],
        queryFn: async () => {
          const ranking = await cjoliService.getRanking(uid);
          loadRanking(ranking);
          return ranking;
        },
      }),
    [loadRanking, cjoliService]
  );
  return { getUser, listUsers, getTourneys, getTeams, getRanking };
};

const useApiPost = () => {
  const { loadTourney, loadRanking } = useCJoli();
  const settingService = useSettingService();
  const cjoliService = useCjoliService();

  const saveTourney = useCallback(
    ({ onSuccess }: { onSuccess?: () => void }) =>
      mutationOptions({
        mutationKey: ["addTourney"],
        mutationFn: async (tourney: Tourney) => {
          const t = await settingService.importTourney(tourney);
          loadTourney(t);
          return t;
        },
        onSuccess,
      }),
    [loadTourney, settingService]
  );
  const saveUserAdminConfig = useCallback(
    ({ onSuccess }: { onSuccess: () => void }) =>
      mutationOptions({
        mutationKey: ["saveUserAdminConfig"],
        mutationFn: async ({
          user,
          admins,
        }: {
          user: User;
          admins: number[];
        }) => await settingService.saveUserAdminConfig(user, admins),
        onSuccess,
      }),
    [settingService]
  );
  const saveMatchOptions = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["saveMatch", uid],
        mutationFn: async (match: Match) => {
          const ranking = await cjoliService.saveMatch(uid, match);
          loadRanking(ranking);
          return ranking;
        },
      }),
    [cjoliService, loadRanking]
  );
  const updateMatchOptions = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["updateMatch", uid],
        mutationFn: async (match: Match) => {
          const ranking = await cjoliService.updateMatch(uid, match);
          loadRanking(ranking);
          return ranking;
        },
      }),
    [cjoliService, loadRanking]
  );
  const clearMatchOptions = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["clearMatch", uid],
        mutationFn: async (match: Match) => {
          const ranking = await cjoliService.clearMatch(uid, match);
          loadRanking(ranking);
          return ranking;
        },
      }),
    [cjoliService, loadRanking]
  );

  return {
    saveTourney,
    saveUserAdminConfig,
    saveMatchOptions,
    updateMatchOptions,
    clearMatchOptions,
  };
};

const useApiDelete = () => {
  const { loadTourney } = useCJoli();
  const navigate = useNavigate();
  const settingServices = useSettingService();

  const removeTourney = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeTourney"],
        mutationFn: async () => {
          await settingServices.removeTourney({ uid });
          navigate("/");
          return true;
        },
      }),
    [navigate, settingServices]
  );

  const removeTeam = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeTeam"],
        mutationFn: async (team: Team) => {
          const tourney = await settingServices.removeTeam({
            uid,
            teamId: team.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  const removePhase = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removePhase"],
        mutationFn: async (phase: Phase) => {
          const tourney = await settingServices.removePhase({
            uid,
            phaseId: phase.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  const removeSquad = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeSquad", uid],
        mutationFn: async ({
          squad,
          phase,
        }: {
          squad: Squad;
          phase: Phase;
        }) => {
          const tourney = await settingServices.removeSquad({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  const removePosition = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removePosition"],
        mutationFn: async ({
          position,
          phase,
          squad,
        }: {
          position: Position;
          phase: Phase;
          squad: Squad;
        }) => {
          const tourney = await settingServices.removePosition({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
            positionId: position.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  const removeMatch = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeMatch"],
        mutationFn: async ({
          match,
          squad,
          phase,
        }: {
          match: Match;
          squad: Squad;
          phase: Phase;
        }) => {
          const tourney = await settingServices.removeMatch({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
            matchId: match.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  const removeRank = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeRank"],
        mutationFn: async (rank: Rank) => {
          const tourney = await settingServices.removeRank({
            uid,
            rankId: rank.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney, settingServices]
  );

  return {
    removeTourney,
    removeTeam,
    removePhase,
    removeSquad,
    removePosition,
    removeMatch,
    removeRank,
  };
};

export const useApi = () => {
  const get = useApiGet();
  const post = useApiPost();
  const del = useApiDelete();

  return {
    ...get,
    ...post,
    ...del,
  };
};
