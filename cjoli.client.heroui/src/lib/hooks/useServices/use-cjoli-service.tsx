import axios from "axios";
import Cookies from "universal-cookie";
import { useConfig } from "@@/hooks";
import {
  Match,
  Position,
  Ranking,
  Team,
  Tourney,
  User,
  UserConfig,
} from "@@/models";

const cookie = new Cookies();

export const useCjoliService = () => {
  const { url } = useConfig();
  const setHeader = () => {
    const token = cookie.get("CJOLI_AUTH_TOKEN");
    axios.defaults.headers.common = {
      Authorization: `Bearer ${token}`,
    };
  };
  setHeader();

  const getTourneys = async () => {
    const { data } = await axios.get<Tourney[]>(`${url}/cjoli/tourneys`);
    return data;
  };

  const getRanking = async (uid: string) => {
    const { data } = await axios.get<Ranking>(`${url}/cjoli/${uid}/ranking`);
    return data;
  };

  const getUser = async () => {
    const { data } = await axios.get<User>(`${url}/user`);
    return data;
  };

  const listUsers = async () => {
    const { data } = await axios.get<User[]>(`${url}/user/list`);
    return data;
  };

  const login = async (user: User) => {
    return await axios
      .post<string>(`${url}/user/login`, user)
      .then(({ data }) => {
        cookie.set("CJOLI_AUTH_TOKEN", data, {
          path: "/",
          maxAge: 24 * 60 * 60,
        });
        setHeader();
        return true;
      })
      .catch((error) => {
        console.log("Unable to login", error);
        return false;
      });
  };

  const register = async (user: User) => {
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

  const update = async (user: User) => {
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

  const updatePosition = async (uid: string, position: Position) => {
    const { data } = await axios.post<Ranking>(
      `${url}/cjoli/${uid}/updatePosition`,
      position
    );
    return data;
  };

  const updateTeam = async (uid: string, team: Team) => {
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

  const logout = () => {
    cookie.remove("CJOLI_AUTH_TOKEN", { path: "/" });
    setHeader();
  };

  const saveMatch = async (uid: string, match: Match) => {
    const { data } = await axios.post(`${url}/cjoli/${uid}/saveMatch`, match);
    return data;
  };

  const clearMatch = async (uid: string, match: Match) => {
    const { data } = await axios.post(`${url}/cjoli/${uid}/clearMatch`, match);
    return data;
  };

  const clearSimulations = async (uid: string, ids: number[]) => {
    const { data } = await axios.post(
      `${url}/cjoli/${uid}/clearSimulations`,
      ids
    );
    return data;
  };

  const updateEstimate = async (uid: string) => {
    const { data } = await axios.get<Ranking>(
      `${url}/cjoli/${uid}/updateEstimate`
    );
    return data;
  };

  const saveUserConfig = async (uid: string, userConfig: UserConfig) => {
    const { data } = await axios.post<Ranking>(
      `${url}/cjoli/${uid}/saveUserConfig`,
      userConfig
    );
    return data;
  };

  const prompt = async (uid: string, lang: string) => {
    const { data } = await axios.get(`${url}/cjoli/${uid}/prompt?lang=${lang}`);
    return data;
  };

  return {
    getTourneys,
    getRanking,
    getUser,
    listUsers,
    register,
    update,
    updatePosition,
    updateTeam,
    login,
    logout,
    saveMatch,
    clearMatch,
    clearSimulations,
    updateEstimate,
    saveUserConfig,
    prompt,
  };
};
