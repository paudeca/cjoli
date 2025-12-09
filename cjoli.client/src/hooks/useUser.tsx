import { useCallback, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { User, UserConfig } from "../models";
import { UserActions } from "../contexts/actions";
import { useCJoli } from "./useCJoli";
import * as cjoliService from "../services/cjoliService";
import useUid from "./useUid";
import { useToast } from "./useToast";
import { useTranslation } from "react-i18next";

export const useUser = () => {
  const ctx = useContext(UserContext);
  const { loadRanking } = useCJoli();
  const uid = useUid();
  if (!ctx) {
    throw new Error("useUser has to be used within <UserProvider>");
  }

  const { tourney } = useCJoli();

  const { state, dispatch } = ctx;
  const loadUser = useCallback(
    (user?: User) => dispatch({ type: UserActions.LOAD_USER, payload: user }),
    [dispatch]
  );
  const setCountUser = useCallback(
    (count: number) =>
      dispatch({ type: UserActions.COUNT_USER, payload: count }),
    [dispatch]
  );

  const handleSaveUserConfig = useCallback(
    async (userConfig: UserConfig) => {
      try {
        const ranking = await cjoliService.saveUserConfig(uid, userConfig);
        loadRanking(ranking);
        const configs =
          state.user?.configs?.map((c) =>
            c.tourneyId == userConfig.tourneyId ? userConfig : c
          ) || [];
        loadUser({ ...state.user, configs } as User);
      } catch (error) {
        console.error("Unable to save userConfig", error);
      }
    },
    [loadRanking, loadUser, uid, state.user]
  );

  const findConfig = (user?: User) => {
    const localTeam = localStorage.getItem("favoriteTeamId");
    return (
      user?.configs?.find((c) => c.tourneyId == tourney?.id) || {
        tourneyId: 0,
        useCustomEstimate: false,
        favoriteTeamId: localTeam ? parseInt(localTeam) : 0,
        isAdmin: false,
      }
    );
  };

  const isConnected = state.user;
  const { showToast } = useToast();
  const { t } = useTranslation();
  const userConfig = findConfig(state.user);

  const saveFavoriteTeam = useCallback(
    async (teamId?: number, hideNotif?: boolean) => {
      isConnected &&
        (await handleSaveUserConfig({
          ...userConfig,
          favoriteTeamId: teamId || 0,
        }));
      !isConnected &&
        localStorage.setItem("favoriteTeamId", (teamId || 0) + "");
      if (!hideNotif) {
        teamId
          ? showToast("success", t("user.favoriteSaved", "Favorite team saved"))
          : showToast(
              "success",
              t("user.favoriteRemoved", "Favorite team removed")
            );
      }
    },
    [handleSaveUserConfig, userConfig, showToast, t, isConnected]
  );

  const isRootAdmin = state.user?.role === "ADMIN";

  return {
    ...state,
    isConnected,
    isRootAdmin,
    isAdmin: isRootAdmin || userConfig.isAdmin,
    findConfig,
    userConfig,
    loadUser,
    setCountUser,
    handleSaveUserConfig,
    saveFavoriteTeam,
  };
};
