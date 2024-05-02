import React from "react";
import { UserContext, UserActions } from "../contexts/UserContext";
import { User } from "../models";

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

  return { ...state, loadUser };
};
