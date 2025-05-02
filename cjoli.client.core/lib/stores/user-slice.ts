import { User } from "@/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "../states";

const initialState: UserState = {
  countUser: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
    },
    setCountUser: (state, action: PayloadAction<number>) => {
      state.countUser = action.payload;
    },
  },
});

export const userActions = userSlice.actions;

export default userSlice.reducer;
