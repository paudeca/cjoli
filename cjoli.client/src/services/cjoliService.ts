import axios from "axios";
import { Ranking, User, Match, Team, Tourney } from "../models";
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

export const getTourneys = async () => {
  const { data } = await axios.get<Tourney[]>(`${url}/cjoli/tourneys`);
  return data;
};

export const getRanking = async (uid: string) => {
  const { data } = await axios.get<Ranking>(`${url}/cjoli/ranking/${uid}`);
  return data;
};

export const getUser = async () => {
  const { data } = await axios.get<User>(`${url}/user`);
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

export const updateTeam = async (uid: string, team: Team) => {
  return await axios
    .post<boolean>(`${url}/cjoli/updateTeam/${uid}`, team)
    .then(async ({ data }) => {
      return data;
    })
    .catch((error) => {
      console.log("Unable to update", error);
      return false;
    });
};

export const logout = () => {
  cookie.remove("CJOLI_AUTH_TOKEN");
  setHeader();
};

export const saveMatch = async (uid: string, match: Match) => {
  const { data } = await axios.post(`${url}/cjoli/saveMatch/${uid}`, match);
  return data;
};

export const clearMatch = async (uid: string, match: Match) => {
  const { data } = await axios.post(`${url}/cjoli/clearMatch/${uid}`, match);
  return data;
};

export const clearSimulations = async (uid: string, ids: number[]) => {
  const { data } = await axios.post(
    `${url}/cjoli/clearSimulations/${uid}`,
    ids
  );
  return data;
};

export const updateSimulation = async (uid: string) => {
  await axios.get(`${url}/cjoli/updateSimulation/${uid}`);
};
