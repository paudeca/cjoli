import { useForm } from "react-hook-form";
import { Match } from "../models";
import { useUser } from "./useUser";
import { useDisclosure } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { useUid } from "./useUid";

export const useMatch = () => {
  const uid = useUid();
  const form =
    useForm<Record<string, { scoreA: number | ""; scoreB: number | "" }>>();
  const blockShotModal = useDisclosure();
  const { userConfig, isAdmin } = useUser();
  const {
    saveMatchOptions,
    updateMatchOptions,
    clearMatchOptions,
    saveUserConfig,
  } = useApi();

  const { mutateAsync: doSaveMatch } = useMutation(saveMatchOptions(uid));
  const { mutateAsync: updateMatch } = useMutation(updateMatchOptions(uid));
  const { mutateAsync: clearMatch } = useMutation(clearMatchOptions(uid));
  const { mutateAsync: handleSaveUserConfig } = useMutation(
    saveUserConfig(uid)
  );

  const saveMatch = async (match: Match) => {
    let { scoreA, scoreB } = form.getValues(`m${match.id}`) ?? {
      scoreA: 0,
      scoreB: 0,
    };
    if (scoreA == "") scoreA = 0;
    if (scoreB == "") scoreB = 0;

    if (match.forfeitA || match.forfeitB) {
      scoreA = 0;
      scoreB = 0;
    }
    if (match.shot && scoreA == scoreB) {
      blockShotModal.onOpen();
      return;
    }
    doSaveMatch({
      ...match,
      scoreA,
      scoreB,
    });
    if (!isAdmin) {
      handleSaveUserConfig({ ...userConfig, useCustomEstimate: true });
    }
  };

  return { saveMatch, updateMatch, clearMatch, form, blockShotModal };
};
