import { useForm } from "react-hook-form";
import { Match } from "../models";
import * as cjoliService from "../services/cjoliService";
import { useCJoli } from "./useCJoli";
import { useModal } from "./useModal";
import { useUser } from "./useUser";

export const useMatch = (uid: string) => {
  const { loadRanking } = useCJoli();

  const { register, getValues } =
    useForm<Record<string, { scoreA: number | ""; scoreB: number | "" }>>();
  const { setShow } = useModal("blockShot");
  const { userConfig, isAdmin, handleSaveUserConfig } = useUser();

  const saveMatch = async (match: Match) => {
    let { scoreA, scoreB } = getValues(`m${match.id}`);
    if (scoreA == "") scoreA = 0;
    if (scoreB == "") scoreB = 0;

    if (match.forfeitA || match.forfeitB) {
      scoreA = 0;
      scoreB = 0;
    }
    if (match.shot && scoreA == scoreB) {
      setShow(true);
      return;
    }
    const ranking = await cjoliService.saveMatch(uid, {
      ...match,
      scoreA,
      scoreB,
    });
    loadRanking(ranking);
    if (!isAdmin) {
      handleSaveUserConfig({ ...userConfig, useCustomEstimate: true });
    }
  };

  const updateMatch = async (match: Match) => {
    const ranking = await cjoliService.updateMatch(uid, match);
    loadRanking(ranking);
  };

  const clearMatch = async (match: Match) => {
    const ranking = await cjoliService.clearMatch(uid, match);
    loadRanking(ranking);
  };

  return { saveMatch, updateMatch, clearMatch, register };
};
