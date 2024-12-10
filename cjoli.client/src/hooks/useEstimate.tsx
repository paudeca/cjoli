import { useCallback, useState } from "react";
import * as cjoliService from "../services/cjoliService";
import useUid from "./useUid";
import { useCJoli } from "./useCJoli";
import { useUser } from "./useUser";
import { useToast } from "./useToast";
import { useTranslation } from "react-i18next";
import { useLogger } from "./useLogger";

export const useEstimate = () => {
  const [loading, setLoading] = useState(false);
  const uid = useUid();
  const { userConfig, isAdmin, handleSaveUserConfig } = useUser();
  const { loadRanking } = useCJoli();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const logger = useLogger();

  const handleUpdateEstimate = useCallback(async () => {
    setLoading(true);
    try {
      const ranking = await cjoliService.updateEstimate(uid);
      loadRanking(ranking);
      if (!isAdmin) {
        handleSaveUserConfig({ ...userConfig, useCustomEstimate: true });
      }
      setLoading(false);
      showToast("success", t("estimate.calculated", "Estimate calculated"));
    } catch (error) {
      logger.error("Unable to update estimate", error);
      showToast(
        "danger",
        t("estimate.calculatedError", "Unable to update estimate")
      );
    }
  }, [
    handleSaveUserConfig,
    isAdmin,
    loadRanking,
    showToast,
    uid,
    userConfig,
    t,
    logger,
  ]);

  return { loading, handleUpdateEstimate };
};
