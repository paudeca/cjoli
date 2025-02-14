import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import cjoliReducer from "./cjoli-slice";
import userReducer from "./user-slice";

export const store = configureStore({
  reducer: {
    cjoli: cjoliReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
