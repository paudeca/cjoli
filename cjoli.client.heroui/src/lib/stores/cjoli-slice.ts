import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CJoliState } from "../states";
import dayjs from "dayjs";
import { Match, Position, Ranking, Squad, Tourney, TypePage } from "../models";

const initialState: CJoliState = {
  daySelected: dayjs().format("YYYY-MM-DD"),
  matches: [],
  theme: {
    primary: "#202644",
    secondary: "#932829",
  },
  page: "welcome",
  loaded: { tourneys: false },
};

export const cjoliSlice = createSlice({
  name: "cjoli",
  initialState,
  reducers: {
    loadTourneys: (state, action: PayloadAction<Tourney[]>) => {
      state.tourneys = action.payload;
      state.tourneys.sort((a, b) => (a.startTime > b.startTime ? -1 : 1));
      state.loaded.tourneys = true;
    },
    loadTourney: (state, action: PayloadAction<Tourney>) => {
      state.tourney = action.payload;
      state.tourney.teams.sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    selectTourney: (state, action: PayloadAction<Tourney>) => {
      state.tourney = action.payload;
    },
    loadRanking: (state, action: PayloadAction<Ranking>) => {
      state.ranking = action.payload;

      state.tourney = state.ranking.tourney;
      state.teams = state.tourney.teams;
      state.teams.sort((a, b) => (a.name > b.name ? 1 : -1));
      state.phases = state.tourney.phases;
      state.squads = state.phases.reduce<Squad[]>(
        (acc, phase) => [...acc, ...phase.squads],
        []
      );
      state.positions = state.squads.reduce<Position[]>(
        (acc, squad) => [...acc, ...squad.positions],
        []
      );
      state.matches = state.squads.reduce<Match[]>(
        (acc, squad) => [...acc, ...squad.matches],
        []
      );
      state.matches.sort((a, b) => {
        if (a.time < b.time) return -1;
        else if (a.time > b.time) return 1;
        else if (a.location && b.location && a.location > b.location) return -1;
        else return 1;
      });
    },
    selectDay: (state, action: PayloadAction<string>) => {
      state.daySelected = action.payload;
    },
    setColor: (
      state,
      action: PayloadAction<{ primary: string; secondary: string }>
    ) => {
      state.theme = action.payload;
    },
    selectPage: (state, action: PayloadAction<TypePage>) => {
      state.page = action.payload;
    },
  },
});

export const cjoliActions = cjoliSlice.actions;

export default cjoliSlice.reducer;
