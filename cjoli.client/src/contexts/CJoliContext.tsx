import React, { Dispatch } from "react";
import {
  EventPhase,
  Gallery,
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

export type ModeScoreType =
  | "tourney"
  | "season"
  | "allTime"
  | { seasons?: string[]; categories?: string[] };

interface CJoliState {
  tourneys?: Tourney[];
  tourney?: Tourney;
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches: Match[];
  events: EventPhase[];
  daySelected: string;
  theme: {
    primary: string;
    secondary: string;
  };
  page: TypePage;
  gallery?: Gallery;
  modeScore: ModeScoreType;
}

export const CJoliContext = React.createContext<{
  state: CJoliState;
  dispatch: Dispatch<Action>;
} | null>(null);

const initialState: CJoliState = {
  daySelected: dayjs().format("YYYY-MM-DD"),
  matches: [],
  events: [],
  theme: {
    primary: "#2c2a37", //"#202644",
    secondary: "#932829",
  },
  page: "welcome",
  modeScore: "tourney",
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
    }
  | { type: CJoliActions.LOAD_GALLERY; payload: Gallery }
  | { type: CJoliActions.SELECT_MODESCORE; payload: ModeScoreType }
  | { type: CJoliActions.LOAD_RANKING_TEAM; payload: Ranking }
  | { type: CJoliActions.LOAD_TEAMS; payload: Team[] };

const reduceLoadRanking = (state: CJoliState, ranking: Ranking) => {
  const tourney = ranking.tourney;
  const teams = tourney.teams;
  teams.sort((a, b) => (a.name > b.name ? 1 : -1));
  const phases = tourney.phases;
  const squads = phases.reduce<Squad[]>(
    (acc, phase) => [...acc, ...phase.squads],
    [],
  );
  squads.sort((a, b) => (a.id > b.id ? 1 : -1));
  const events = phases.reduce<EventPhase[]>(
    (acc, phase) => [...acc, ...phase.events],
    [],
  );
  const positions = squads.reduce<Position[]>(
    (acc, squad) => [...acc, ...squad.positions],
    [],
  );
  const matches = squads.reduce<Match[]>(
    (acc, squad) => [...acc, ...squad.matches],
    [],
  );
  matches.sort((a, b) => {
    if (a.time < b.time) return -1;
    else if (a.time > b.time) return 1;
    else if (a.location && b.location && a.location > b.location) return -1;
    else return 1;
  });
  return {
    ...state,
    ranking,
    tourney,
    teams,
    phases,
    squads,
    positions,
    matches,
    events,
  };
};

const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case CJoliActions.LOAD_TOURNEYS: {
      const tourneys = action.payload;
      tourneys.sort((a, b) => (a.startTime > b.startTime ? -1 : 1));
      return { ...state, tourneys };
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
      return reduceLoadRanking(state, action.payload);
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
    case CJoliActions.LOAD_GALLERY: {
      return { ...state, gallery: action.payload };
    }
    case CJoliActions.SELECT_MODESCORE: {
      return { ...state, modeScore: action.payload };
    }
    case CJoliActions.LOAD_RANKING_TEAM: {
      return {
        ...state,
        ranking: action.payload,
      };
    }
    case CJoliActions.LOAD_TEAMS: {
      //return { ...state, teams: action.payload, rankingg: undefined };
      return { ...state, teams: action.payload };
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
