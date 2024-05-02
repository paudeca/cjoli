import axios from "axios";
import { Ranking, User, Match, Team } from "../models";
import Cookie from "universal-cookie";

export const getRanking = async () => {
  const { data } = await axios.get<Ranking>(
    `${import.meta.env.VITE_API_URL}/cjoli/ranking/123`
  );
  return data;
};

export const getUser = async () => {
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  const { data } = await axios.get<User>(
    `${import.meta.env.VITE_API_URL}/user`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const login = async (user: User) => {
  return await axios
    .post<string>(`${import.meta.env.VITE_API_URL}/user/login`, user)
    .then(({ data }) => {
      const cookie = new Cookie();
      cookie.set("CJOLI_AUTH_TOKEN", data, { path: "/", maxAge: 24 * 60 * 60 });
      return true;
    })
    .catch((error) => {
      console.log("Unable to login", error);
      return false;
    });
};

export const register = async (user: User) => {
  return await axios
    .post<User>(`${import.meta.env.VITE_API_URL}/user/register`, user)
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
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  return await axios
    .post<boolean>(`${import.meta.env.VITE_API_URL}/user/update`, user, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(async ({ data }) => {
      return data;
    })
    .catch((error) => {
      console.log("Unable to update", error);
      return false;
    });
};

export const updateTeam = async (team: Team) => {
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  return await axios
    .post<boolean>(
      `${import.meta.env.VITE_API_URL}/cjoli/updateTeam/123`,
      team,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(async ({ data }) => {
      return data;
    })
    .catch((error) => {
      console.log("Unable to update", error);
      return false;
    });
};

export const logout = () => {
  const cookie = new Cookie();
  cookie.remove("CJOLI_AUTH_TOKEN");
};

export const saveMatch = async (match: Match) => {
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/cjoli/saveMatch/123`,
    match,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const clearMatch = async (match: Match) => {
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/cjoli/clearMatch/123`,
    match,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
