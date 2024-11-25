import React, { Dispatch } from "react";
import {
  Match,
  Phase,
  Position,
  Ranking,
  Squad,
  Team,
  Tourney,
  TypePage,
} from "../models";
import { CJoliActions } from "./actions";
import dayjs from "dayjs";

interface CJoliState {
  tourneys?: Tourney[];
  tourney?: Tourney;
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches: Match[];
  daySelected: string;
  theme: {
    primary: string;
    secondary: string;
  };
  page: TypePage;
}

export const CJoliContext = React.createContext<{
  state: CJoliState;
  dispatch: Dispatch<Action>;
} | null>(null);

const initialState: CJoliState = {
  daySelected: dayjs().format("YYYY-MM-DD"),
  matches: [],
  theme: {
    primary: "#202644",
    secondary: "#932829",
  },
  page: "welcome",
};

type Action =
  | {
      type: CJoliActions.LOAD_TOURNEYS;
      payload: Tourney[];
    }
  | {
      type: CJoliActions.SELECT_TOURNEY;
      payload: Tourney;
    }
  | {
      type: CJoliActions.LOAD_RANKING;
      payload: Ranking;
    }
  | { type: CJoliActions.SELECT_DAY; payload: string }
  | { type: CJoliActions.LOAD_TOURNEY; payload: Tourney }
  | {
      type: CJoliActions.SET_COLOR;
      payload: { primary: string; secondary: string };
    }
  | {
      type: CJoliActions.SELECT_PAGE;
      payload: TypePage;
    };

const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case CJoliActions.LOAD_TOURNEYS: {
      return { ...state, tourneys: action.payload };
    }
    case CJoliActions.LOAD_TOURNEY: {
      const tourney = action.payload;
      const teams = tourney.teams;
      teams.sort((a, b) => (a.name > b.name ? 1 : -1));
      return { ...state, tourney: tourney };
    }
    case CJoliActions.SELECT_TOURNEY: {
      return {
        ...state,
        tourney: action.payload,
      };
    }
    case CJoliActions.LOAD_RANKING: {
      const ranking = action.payload;
      const tourney = ranking.tourney;
      const teams = tourney.teams;
      teams.sort((a, b) => (a.name > b.name ? 1 : -1));
      const phases = tourney.phases;
      const squads = phases.reduce<Squad[]>(
        (acc, phase) => [...acc, ...phase.squads],
        []
      );
      const positions = squads.reduce<Position[]>(
        (acc, squad) => [...acc, ...squad.positions],
        []
      );
      const matches = squads.reduce<Match[]>(
        (acc, squad) => [...acc, ...squad.matches],
        []
      );
      return {
        ...state,
        ranking,
        tourney,
        teams,
        phases,
        squads,
        positions,
        matches,
      };
    }
    case CJoliActions.SELECT_DAY: {
      return {
        ...state,
        daySelected: action.payload,
      };
    }
    case CJoliActions.SET_COLOR: {
      return { ...state, theme: action.payload };
    }
    case CJoliActions.SELECT_PAGE: {
      return { ...state, page: action.payload };
    }
  }
};

export const CJoliProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <CJoliContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </CJoliContext.Provider>
  );
};
