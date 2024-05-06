import { UserConfig } from "./UserConfig";

export interface User {
  login: string;
  password: string;
  role?: "ADMIN";
  configs?: UserConfig[];
}
