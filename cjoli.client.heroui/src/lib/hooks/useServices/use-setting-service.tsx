import Cookies from "universal-cookie";
import { useConfig } from "../useConfig";
import axios from "axios";
import { Team, Tourney, User } from "@@/models";

const cookie = new Cookies();

export const useSettingService = () => {
  const { url } = useConfig();
  const setHeader = () => {
    const token = cookie.get("CJOLI_AUTH_TOKEN");
    axios.defaults.headers.common = {
      Authorization: `Bearer ${token}`,
    };
  };
  setHeader();

  const getTeams = async () => {
    const { data } = await axios.get<Team[]>(`${url}/setting/teams`);
    return data;
  };

  const importTourney = async (tourney: Tourney) => {
    const { data } = await axios.post<Tourney>(
      `${url}/setting/tourney`,
      tourney
    );
    return data;
  };

  const saveUserAdminConfig = async (user: User, admins: number[]) => {
    await axios.post<void>(`${url}/setting/user/${user.id}/admins`, admins);
  };

  const removeTourney = async ({ uid }: { uid: string }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}`
    );
    return data;
  };

  const removeTeam = async ({
    uid,
    teamId,
  }: {
    uid: string;
    teamId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/teams/${teamId}`
    );
    return data;
  };

  const removePhase = async ({
    uid,
    phaseId,
  }: {
    uid: string;
    phaseId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/phases/${phaseId}`
    );
    return data;
  };

  const removeSquad = async ({
    uid,
    phaseId,
    squadId,
  }: {
    uid: string;
    phaseId: number;
    squadId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}`
    );
    return data;
  };

  const removePosition = async ({
    uid,
    phaseId,
    squadId,
    positionId,
  }: {
    uid: string;
    phaseId: number;
    squadId: number;
    positionId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}/positions/${positionId}`
    );
    return data;
  };

  const removeMatch = async ({
    uid,
    phaseId,
    squadId,
    matchId,
  }: {
    uid: string;
    phaseId: number;
    squadId: number;
    matchId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}/matches/${matchId}`
    );
    return data;
  };

  const removeRank = async ({
    uid,
    rankId,
  }: {
    uid: string;
    rankId: number;
  }) => {
    const { data } = await axios.delete<Tourney>(
      `${url}/setting/tourney/${uid}/ranks/${rankId}`
    );
    return data;
  };

  return {
    getTeams,
    importTourney,
    saveUserAdminConfig,
    removeTourney,
    removeTeam,
    removePhase,
    removeSquad,
    removePosition,
    removeMatch,
    removeRank,
  };
};
