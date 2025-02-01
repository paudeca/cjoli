import {
  DefaultError,
  queryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { useCallback } from "react";
import * as cjoliService from "../services/cjoliService";
import * as settingService from "../services/settingService";
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
    [loadUser]
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
    []
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
    [loadTourneys]
  );

  const getTeams = useCallback(
    () =>
      queryOptions({
        queryKey: ["getTeams"],
        queryFn: async () => settingService.getTeams(),
        initialData: [],
        retry: 0,
      }),
    []
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
    [loadRanking]
  );
  return { getUser, listUsers, getTourneys, getTeams, getRanking };
};

const useApiPost = () => {
  const { loadTourney } = useCJoli();

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
    [loadTourney]
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
        }) => {
          await settingService.saveUserAdminConfig(user, admins);
        },
        onSuccess,
      }),
    []
  );
  return { saveTourney, saveUserAdminConfig };
};

const useApiDelete = () => {
  const { loadTourney } = useCJoli();
  const navigate = useNavigate();

  const removeTourney = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeTourney"],
        mutationFn: async () => {
          await settingService.removeTourney({ uid });
          navigate("/");
          return true;
        },
      }),
    [navigate]
  );

  const removeTeam = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeTeam"],
        mutationFn: async (team: Team) => {
          const tourney = await settingService.removeTeam({
            uid,
            teamId: team.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
  );

  const removePhase = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removePhase"],
        mutationFn: async (phase: Phase) => {
          const tourney = await settingService.removePhase({
            uid,
            phaseId: phase.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
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
          const tourney = await settingService.removeSquad({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
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
          const tourney = await settingService.removePosition({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
            positionId: position.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
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
          const tourney = await settingService.removeMatch({
            uid,
            phaseId: phase.id,
            squadId: squad.id,
            matchId: match.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
  );

  const removeRank = useCallback(
    (uid: string) =>
      mutationOptions({
        mutationKey: ["removeRank"],
        mutationFn: async (rank: Rank) => {
          const tourney = await settingService.removeRank({
            uid,
            rankId: rank.id,
          });
          loadTourney(tourney);
          return true;
        },
      }),
    [loadTourney]
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
