import React from "react";
import { Ranking } from "../models/Ranking";
import { Team } from "../models/Team";
import { Position } from "../models/Position";
import { Phase } from "../models/Phase";
import { Squad } from "../models/Squad";
import { Match } from "../models/Match";

interface CJoliState {
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches?: Match[];
}
interface CJoliAction {
  loadRanking: (ranking: Ranking) => void;
  getTeam: (teamId: number) => Team | undefined;
  getPosition: (positionId: number) => Position | undefined;
}

export const CJoliContext = React.createContext<({ state: CJoliState } & CJoliAction) | null>(null);

const initialState: CJoliState = {};

enum Actions {
  LOAD_RANKING = "LOAD_RANKING",
}

interface Action {
  type: keyof typeof Actions;
  payload: unknown;
}
const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case Actions.LOAD_RANKING: {
      const ranking = action.payload as Ranking;
      const teams = ranking.tourney.teams;
      const phases = ranking.tourney.phases;
      const squads = phases.reduce<Squad[]>((acc, phase) => [...acc, ...phase.squads], []);
      const positions = squads.reduce<Position[]>((acc, squad) => [...acc, ...squad.positions], []);
      const matches = squads.reduce<Match[]>((acc, squad) => [...acc, ...squad.matches], []);
      return { ...state, ranking, teams, phases, squads, positions, matches };
    }
  }
  return state;
};

export const CJoliProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const loadRanking = React.useCallback((ranking: Ranking) => dispatch({ type: Actions.LOAD_RANKING, payload: ranking }), []);
  const getTeam = React.useCallback((teamId: number) => state.teams?.find((t) => t.id === teamId), [state.teams]);
  const getPosition = React.useCallback((positionId: number) => state.positions?.find((p) => p.id === positionId), [state.positions]);

  return <CJoliContext.Provider value={{ state, loadRanking, getTeam, getPosition }}>{children}</CJoliContext.Provider>;
};

export const useCJoli = () => {
  const ctx = React.useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliContext.Provider>");
  }
  return ctx;
};
