import axios from "axios";
import { Message, Team, Tourney, User } from "../models";
import Cookie from "universal-cookie";

const url = import.meta.env.VITE_API_URL;
const cookie = new Cookie();

const setHeader = () => {
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  axios.defaults.headers.common = {
    Authorization: `Bearer ${token}`,
    "CJoli-UseEstimate": localStorage.getItem("useEstimate"),
  };
};
setHeader();

export const getTeams = async () => {
  const { data } = await axios.get<Team[]>(`${url}/setting/teams`);
  return data;
};

export const synchroTourney = async (uid: string) => {
  const { data } = await axios.post<Tourney>(
    `${url}/setting/tourney/${uid}/synchro`,
    {}
  );
  return data;
};

export const importTourney = async (tourney: Tourney) => {
  const { data } = await axios.post<Tourney>(`${url}/setting/tourney`, tourney);
  return data;
};

export const saveUserAdminConfig = async (user: User, admins: number[]) => {
  await axios.post<void>(`${url}/setting/user/${user.id}/admins`, admins);
};

export const updateMessage = async ({
  uid,
  message,
}: {
  uid: string;
  message: Message;
}) => {
  await axios.post<void>(`${url}/setting/${uid}/message`, message);
};

export const deleteMessage = async ({
  uid,
  message,
}: {
  uid: string;
  message: Message;
}) => {
  await axios.delete<void>(`${url}/setting/${uid}/message/${message.id}`);
};

export const removeTourney = async ({ uid }: { uid: string }) => {
  const { data } = await axios.delete<Tourney>(`${url}/setting/tourney/${uid}`);
  return data;
};

export const removeTeam = async ({
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

export const removePhase = async ({
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

export const removeSquad = async ({
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

export const removePosition = async ({
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

export const removeMatch = async ({
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

export const removeRank = async ({
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

export const removeUser = async ({ userId }: { userId: number }) => {
  await axios.delete<void>(`${url}/setting/users/${userId}`);
};

export const removeEvent = async ({
  uid,
  phaseId,
  eventId,
}: {
  uid: string;
  phaseId: number;
  eventId: number;
}) => {
  const { data } = await axios.delete<Tourney>(
    `${url}/setting/tourney/${uid}/phases/${phaseId}/events/${eventId}`
  );
  return data;
};

export const replaceTeam = async ({
  uid,
  teamId,
  newTeamId,
}: {
  uid: string;
  teamId: number;
  newTeamId: number;
}) => {
  const { data } = await axios.post<Tourney>(
    `${url}/setting/tourney/${uid}/teams/${teamId}/replace/${newTeamId}`
  );
  return data;
};
