import axios from "axios";
import { Ranking } from "../models/Ranking";

export const getRanking = async () => {
  const { data } = await axios.get<Ranking>(`${import.meta.env.VITE_API_URL}/cjoli/ranking/123`);
  return data;
};
