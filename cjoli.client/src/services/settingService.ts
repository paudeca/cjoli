import axios from "axios";
import { Team, Tourney } from "../models";
import Cookie from "universal-cookie";

const url = import.meta.env.VITE_API_URL;
const cookie = new Cookie();

const setHeader = () => {
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  axios.defaults.headers.common = {
    Authorization: `Bearer ${token}`,
  };
};
setHeader();

export const getTourney = async (uid: string) => {
  const { data } = await axios.get<Tourney>(`${url}/setting/tourney/${uid}`);
  return data;
};

export const getTeams = async () => {
  const { data } = await axios.get<Team[]>(`${url}/setting/teams`);
  return data;
};

export const importTourney = async (tourney: Tourney) => {
  const { data } = await axios.post<Tourney>(`${url}/setting/tourney`, tourney);
  return data;
};

export const removeTourney = async (uid: string) => {
  const { data } = await axios.delete<Tourney>(`${url}/setting/tourney/${uid}`);
  return data;
};

export const removeTeam = async (uid: string, teamId: number) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/teams/${teamId}`
  );
  return data;
};

export const removePhase = async (uid: string, phaseId: number) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/phases/${phaseId}`
  );
  return data;
};

export const removeSquad = async (
  uid: string,
  phaseId: number,
  squadId: number
) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}`
  );
  return data;
};

export const removePosition = async (
  uid: string,
  phaseId: number,
  squadId: number,
  positionId: number
) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}/positions/${positionId}`
  );
  return data;
};

export const removeMatch = async (
  uid: string,
  phaseId: number,
  squadId: number,
  matchId: number
) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/phases/${phaseId}/squads/${squadId}/matches/${matchId}`
  );
  return data;
};

export const removeRank = async (uid: string, rankId: number) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/ranks/${rankId}`
  );
  return data;
};
