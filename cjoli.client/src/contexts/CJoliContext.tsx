import React from "react";
import { Ranking } from "../models/Ranking";
import { Team } from "../models/Team";
import { Position } from "../models/Position";
import { Phase } from "../models/Phase";
import { Squad } from "../models/Squad";
import { Match } from "../models/Match";
import { User } from "../models/User";

interface CJoliState {
  user?: User;
  ranking?: Ranking;
  teams?: Team[];
  phases?: Phase[];
  squads?: Squad[];
  positions?: Position[];
  matches?: Match[];
}
interface CJoliAction {
  loadUser: (user?: User) => void;
  loadRanking: (ranking: Ranking) => void;
  getSquad: (squadId: number) => Squad | undefined;
  getTeam: (teamId: number) => Team | undefined;
  getTeamFromPosition: (
    positionValue: number,
    squadId: number
  ) => Team | undefined;
  getPosition: (positionId: number) => Position | undefined;
}

const CJoliContext = React.createContext<
  ({ state: CJoliState } & CJoliAction) | null
>(null);

const initialState: CJoliState = {};

enum Actions {
  LOAD_USER = "LOAD_USER",
  LOAD_RANKING = "LOAD_RANKING",
}

interface Action {
  type: keyof typeof Actions;
  payload: unknown;
}
const reducer = (state: CJoliState, action: Action) => {
  switch (action.type) {
    case Actions.LOAD_USER: {
      const user = action.payload as User;
      return { ...state, user };
    }
    case Actions.LOAD_RANKING: {
      const ranking = action.payload as Ranking;
      const teams = ranking.tourney.teams;
      const phases = ranking.tourney.phases;
      const squads = phases.reduce<Squad[]>(
        (acc, phase) => [...acc, ...phase.squads],
        []
      );
      const positions = squads.reduce<Position[]>(
        (acc, squad) => [
          ...acc,
          ...squad.positions.map((p) => ({ ...p, squadId: squad.id })),
        ],
        []
      );
      const matches = squads.reduce<Match[]>(
        (acc, squad) => [
          ...acc,
          ...squad.matches.map((m) => ({ ...m, squadId: squad.id })),
        ],
        []
      );
      return { ...state, ranking, teams, phases, squads, positions, matches };
    }
  }
  return state;
};

export const CJoliProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const loadUser = React.useCallback(
    (user?: User) => dispatch({ type: Actions.LOAD_USER, payload: user }),
    []
  );
  const loadRanking = React.useCallback(
    (ranking: Ranking) =>
      dispatch({ type: Actions.LOAD_RANKING, payload: ranking }),
    []
  );
  const getSquad = React.useCallback(
    (squadId: number) => state.squads?.find((s) => s.id === squadId),
    [state.squads]
  );
  const getTeam = React.useCallback(
    (teamId: number) => state.teams?.find((t) => t.id === teamId),
    [state.teams]
  );
  const getPosition = React.useCallback(
    (positionId: number) => state.positions?.find((p) => p.id === positionId),
    [state.positions]
  );
  const getTeamFromPosition = React.useCallback(
    (positionValue: number, squadId: number) => {
      const position = state.positions?.find(
        (p) => p.value == positionValue && p.squadId == squadId
      );
      return position?.teamId ? getTeam(position?.teamId) : undefined;
    },
    [state.positions]
  );

  return (
    <CJoliContext.Provider
      value={{
        state,
        loadUser,
        loadRanking,
        getSquad,
        getTeam,
        getPosition,
        getTeamFromPosition,
      }}
    >
      {children}
    </CJoliContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCJoli = () => {
  const ctx = React.useContext(CJoliContext);
  if (!ctx) {
    throw new Error("useCJoli has to be used within <CJoliProvider>");
  }
  return ctx;
};
