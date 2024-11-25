import { useContext } from "react";
import { MatchRowContext } from "./MatchRowContext";

export const useMatchRow = () => {
  const ctx = useContext(MatchRowContext);
  if (!ctx) {
    throw new Error("useMatchRow has to be used within <MatchRowProvider>");
  }
  return { ...ctx };
};
