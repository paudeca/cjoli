import React, { Dispatch } from "react";
import { User } from "../models";
import { UserActions } from "./actions";

interface UserState {
  user?: User;
}

export const UserContext = React.createContext<{
  state: UserState;
  dispatch: Dispatch<Action>;
} | null>(null);

const initialState: UserState = {};

type Action = {
  type: UserActions.LOAD_USER;
  payload?: User;
};

const reducer = (state: UserState, action: Action) => {
  switch (action.type) {
    case UserActions.LOAD_USER: {
      const user = action.payload;
      return { ...state, user };
    }
  }
  return state;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <UserContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
