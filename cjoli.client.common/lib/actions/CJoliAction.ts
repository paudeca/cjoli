import { Ranking, Tourney, TypePage } from "@/models";
import { CJoliActions } from ".";

export type CJoliAction =
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
