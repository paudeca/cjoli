import React, { Dispatch } from "react";
import {
  Match,
  Phase,
  Position,
  Ranking,
  Squad,
  Team,
  Tourney,
} from "../models";
import { CJoliActions } from "./actions";

interface CJoliState {
  tourneys?: Tourney[];
  tourney?: Tourney;
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches?: Match[];
}

export const CJoliContext = React.createContext<{
  state: CJoliState;
  dispatch: Dispatch<Action>;
} | null>(null);

const initialState: CJoliState = {};

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
    };
const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case CJoliActions.LOAD_TOURNEYS: {
      return { ...state, tourneys: action.payload };
    }
    case CJoliActions.SELECT_TOURNEY: {
      return { ...state, tourney: action.payload };
    }
    case CJoliActions.LOAD_RANKING:
      {
        const ranking = action.payload;
        const tourney = ranking.tourney;
        const teams = tourney.teams;
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
      return state;
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
