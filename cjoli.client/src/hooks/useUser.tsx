import React from "react";
import { UserContext } from "../contexts/UserContext";
import { User } from "../models";
import { UserActions } from "../contexts/actions";
import { useCJoli } from "./useCJoli";

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

  const { tourney } = useCJoli();

  return {
    ...state,
    isConnected: state.user,
    isAdmin: state.user?.role === "ADMIN",
    userConfig: state.user?.configs?.find(
      (c) => c.tourneyId == tourney?.id
    ) || { tourneyId: 0, activeSimulation: false, useCustomSimulation: false },
    loadUser,
  };
};
