import axios from "axios";
import { Ranking } from "../models/Ranking";
import { User } from "../models/User";
import Cookie from "universal-cookie";

export const getRanking = async () => {
  const { data } = await axios.get<Ranking>(`${import.meta.env.VITE_API_URL}/cjoli/ranking/123`);
  return data;
};

export const getUser = async () => {
  const cookie = new Cookie();
  const token = cookie.get("CJOLI_AUTH_TOKEN");
  const { data } = await axios.get<User>(`${import.meta.env.VITE_API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
};

export const login = async (user: User) => {
  const { data: token } = await axios.post<string>(`${import.meta.env.VITE_API_URL}/user/login`, user);
  const cookie = new Cookie();
  cookie.set("CJOLI_AUTH_TOKEN", token, { path: "/", maxAge: 24 * 60 * 60 });
};

export const logout = () => {
  const cookie = new Cookie();
  cookie.remove("CJOLI_AUTH_TOKEN");
};
