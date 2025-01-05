import { useCallback, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { User, UserConfig } from "../models";
import { UserActions } from "../contexts/actions";
import { useCJoli } from "./useCJoli";
import * as cjoliService from "../services/cjoliService";
import useUid from "./useUid";

export const useUser = () => {
  const ctx = useContext(UserContext);
  const { loadRanking } = useCJoli();
  const uid = useUid();
  if (!ctx) {
    throw new Error("useUser has to be used within <UserProvider>");
  }

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

  const { tourney } = useCJoli();

  const findConfig = (user?: User) => {
    return (
      user?.configs?.find((c) => c.tourneyId == tourney?.id) || {
        tourneyId: 0,
        useCustomEstimate: false,
        favoriteTeamId: 0,
        isAdmin: false,
      }
    );
  };

  const userConfig = findConfig(state.user);
  const isRootAdmin = state.user?.role === "ADMIN";

  return {
    ...state,
    isConnected: state.user,
    isRootAdmin,
    isAdmin: isRootAdmin || userConfig.isAdmin,
    findConfig,
    userConfig,
    loadUser,
    setCountUser,
    handleSaveUserConfig,
  };
};
