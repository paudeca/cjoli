import { CJoliAction, CJoliActions } from "@/actions";
import { CJoliContext } from "@/contexts";
import { Match, Position, Ranking, Squad } from "@/models";
import { CJoliState } from "@/states";
import dayjs from "dayjs";
import { useReducer } from "react";

const initialState: CJoliState = {
  daySelected: dayjs().format("YYYY-MM-DD"),
  matches: [],
  theme: {
    primary: "#202644",
    secondary: "#932829",
  },
  page: "welcome",
};

const reduceLoadRanking = (state: CJoliState, ranking: Ranking) => {
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
  };
};

const reducer = (state: CJoliState, action: CJoliAction) => {
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
  }
};

export const CJoliProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
