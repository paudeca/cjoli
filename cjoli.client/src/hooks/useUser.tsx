import React from "react";
import { UserContext } from "../contexts/UserContext";
import { User } from "../models";
import { UserActions } from "../contexts/actions";

export const useUser = () => {
  const ctx = React.useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser has to be used within <UserProvider>");
  }
  const { state, dispatch } = ctx;
  const loadUser = React.useCallback(
    (user?: User) => dispatch({ type: UserActions.LOAD_USER, payload: user }),
    []
  );

  return {
    ...state,
    isConnected: state.user,
    isAdmin: state.user?.role === "ADMIN",
    loadUser,
  };
};
