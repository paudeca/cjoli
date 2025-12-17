import axios from "axios";
import {
  Ranking,
  User,
  Match,
  Team,
  Tourney,
  UserConfig,
  Position,
  Gallery,
  EventPhase,
} from "../models";
import Cookie from "universal-cookie";
import { ModeScoreTypeObject } from "../contexts/CJoliContext";

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

export const getTourneys = async (teamId: number) => {
  const { data } = await axios.get<Tourney[]>(
    `${url}/cjoli/tourneys${teamId > 0 ? `/${teamId}` : ""}`
  );
  return data;
};

export const getRanking = async (uid: string) => {
  setHeader();
  const { data } = await axios.get<Ranking>(`${url}/cjoli/${uid}/ranking`);
  return data;
};

export const getUser = async () => {
  const { data } = await axios.get<User>(`${url}/user`);
  return data;
};

export const getTeam = async (
  teamId: number,
  modeScore: ModeScoreTypeObject
) => {
  setHeader();
  let params = "";
  if (typeof modeScore == "object") {
    params = [
      ...(modeScore.categories?.map((c) => `categories=${c}`) || []),
      ...(modeScore.seasons?.map((s) => `seasons=${s}`) || []),
    ].join("&");
  }
  const { data } = await axios.get<Ranking>(
    `${url}/cjoli/team/${teamId}?${params}`
  );
  return data;
};

export const listUsers = async () => {
  const { data } = await axios.get<User[]>(`${url}/user/list`);
  return data;
};

export const login = async (user: User) => {
  return await axios
    .post<string>(`${url}/user/login`, user)
    .then(({ data }) => {
      cookie.set("CJOLI_AUTH_TOKEN", data, { path: "/", maxAge: 24 * 60 * 60 });
      setHeader();
      return true;
    })
    .catch((error) => {
      console.log("Unable to login", error);
      return false;
    });
};

export const register = async (user: User) => {
  return await axios
    .post<User>(`${url}/user/register`, user)
    .then(async () => {
      await login(user);
      return true;
    })
    .catch((error) => {
      console.log("Unable to register", error);
      return false;
    });
};

export const update = async (user: User) => {
  return await axios
    .post<boolean>(`${url}/user/update`, user)
    .then(async ({ data }) => {
      return data;
    })
    .catch((error) => {
      console.log("Unable to update", error);
      return false;
    });
};

export const updatePosition = async (uid: string, position: Position) => {
  const { data } = await axios.post<Ranking>(
    `${url}/cjoli/${uid}/updatePosition`,
    position
  );
  return data;
};

export const updateTeam = async (uid: string, team: Team) => {
  return await axios
    .post<Ranking>(`${url}/cjoli/${uid}/updateTeam`, team)
    .then(async ({ data }) => {
      return data;
    })
    .catch((error) => {
      console.log("Unable to update", error);
      return undefined;
    });
};

export const getTeams = async () => {
  const { data } = await axios.get<Team[]>(`${url}/cjoli/teams`);
  return data;
};

export const logout = () => {
  cookie.remove("CJOLI_AUTH_TOKEN", { path: "/" });
  setHeader();
};

export const saveMatch = async (uid: string, match: Match) => {
  const { data } = await axios.post(`${url}/cjoli/${uid}/saveMatch`, match);
  return data;
};

export const updateMatch = async (uid: string, match: Match) => {
  const { data } = await axios.post(`${url}/cjoli/${uid}/updateMatch`, match);
  return data;
};

export const clearMatch = async (uid: string, match: Match) => {
  const { data } = await axios.post(`${url}/cjoli/${uid}/clearMatch`, match);
  return data;
};

export const updateEvent = async (
  uid: string,
  event: EventPhase,
  params: object
) => {
  const { data } = await axios.post(`${url}/cjoli/${uid}/updateEvent`, {
    ...event,
    datas: JSON.stringify(params),
  });
  return data;
};

export const clearSimulations = async (uid: string, ids: number[]) => {
  const { data } = await axios.post(
    `${url}/cjoli/${uid}/clearSimulations`,
    ids
  );
  return data;
};

export const updateEstimate = async (uid: string) => {
  const { data } = await axios.get<Ranking>(
    `${url}/cjoli/${uid}/updateEstimate`
  );
  return data;
};

export const saveUserConfig = async (uid: string, userConfig: UserConfig) => {
  setHeader();
  const { data } = await axios.post<Ranking>(
    `${url}/cjoli/${uid}/saveUserConfig`,
    userConfig
  );
  return data;
};

export const prompt = async (uid: string, lang: string) => {
  const { data } = await axios.get(`${url}/cjoli/${uid}/prompt?lang=${lang}`);
  return data;
};

export const getGallery = async (
  uid: string,
  page: number,
  waiting: boolean,
  random: boolean
  // eslint-disable-next-line max-params
) => {
  const { data } = await axios.get<Gallery>(
    `${url}/cjoli/${uid}/gallery/${page}${waiting ? "?waiting=true" : ""}${random ? "?random=true" : ""}`
  );
  return data;
};
