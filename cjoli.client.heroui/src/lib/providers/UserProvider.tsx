import { UserAction, UserActions } from "@@/actions";
import { UserContext } from "@@/contexts";
import { UserState } from "@@/states";
import { useReducer } from "react";

const initialState: UserState = { countUser: 0 };

const reducer = (state: UserState, action: UserAction) => {
  switch (action.type) {
    case UserActions.LOAD_USER: {
      const user = action.payload;
      return { ...state, user };
    }
    case UserActions.COUNT_USER:
      return { ...state, countUser: action.payload };
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
