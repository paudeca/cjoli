import React from "react";
import { UserContext } from "../contexts/UserContext";
import { User, UserConfig } from "../models";
import { UserActions } from "../contexts/actions";
import { useCJoli } from "./useCJoli";
import * as cjoliService from "../services/cjoliService";
import useUid from "./useUid";

export const useUser = () => {
  const ctx = React.useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser has to be used within <UserProvider>");
  }
  const { state, dispatch } = ctx;
  const loadUser = React.useCallback(
    (user?: User) => dispatch({ type: UserActions.LOAD_USER, payload: user }),
    [dispatch]
  );

  const { loadRanking } = useCJoli();
  const uid = useUid();

  const handleSaveUserConfig = React.useCallback(
    async (userConfig: UserConfig) => {
      const ranking = await cjoliService.saveUserConfig(uid, userConfig);
      loadRanking(ranking);
      const configs =
        state.user?.configs?.map((c) =>
          c.tourneyId == userConfig.tourneyId ? userConfig : c
        ) || [];
      loadUser({ ...state.user, configs } as User);
    },
    [loadRanking, loadUser, uid, state.user]
  );

  const { tourney } = useCJoli();

  return {
    ...state,
    isConnected: state.user,
    isAdmin: state.user?.role === "ADMIN",
    userConfig: state.user?.configs?.find(
      (c) => c.tourneyId == tourney?.id
    ) || { tourneyId: 0, useCustomEstimate: false, favoriteTeamId: 0 },
    loadUser,
    handleSaveUserConfig,
  };
};
