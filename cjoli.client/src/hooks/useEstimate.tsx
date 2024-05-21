import React from "react";
import * as cjoliService from "../services/cjoliService";
import useUid from "./useUid";
import { useCJoli } from "./useCJoli";
import { useUser } from "./useUser";
import { useToast } from "./useToast";

export const useEstimate = () => {
  const [loading, setLoading] = React.useState(false);
  const uid = useUid();
  const { userConfig, isAdmin, handleSaveUserConfig } = useUser();
  const { loadRanking } = useCJoli();
  const { showToast } = useToast();

  const handleUpdateEstimate = React.useCallback(async () => {
    setLoading(true);
    const ranking = await cjoliService.updateEstimate(uid);
    loadRanking(ranking);
    if (!isAdmin) {
      handleSaveUserConfig({ ...userConfig, useCustomEstimate: true });
    }
    setLoading(false);
    showToast("success", "Estimate calculated");
  }, [handleSaveUserConfig, isAdmin, loadRanking, showToast, uid, userConfig]);

  return { loading, handleUpdateEstimate };
};
