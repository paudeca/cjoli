import { UserConfig } from "./UserConfig";

export interface User {
  id: number;
  login: string;
  password: string;
  role?: "ADMIN";
  configs?: UserConfig[];
}
