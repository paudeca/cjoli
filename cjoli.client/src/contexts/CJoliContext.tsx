import React, { Dispatch } from "react";
import { Match, Phase, Position, Ranking, Squad, Team } from "../models";

interface CJoliState {
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

export enum CJoliActions {
  LOAD_RANKING = "LOAD_RANKING",
}

interface Action {
  type: CJoliActions.LOAD_RANKING;
  payload: Ranking;
}
const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case CJoliActions.LOAD_RANKING:
      {
        const ranking = action.payload;
        const teams = ranking.tourney.teams;
        const phases = ranking.tourney.phases;
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
        return { ...state, ranking, teams, phases, squads, positions, matches };
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
