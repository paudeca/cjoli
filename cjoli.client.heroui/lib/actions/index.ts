export enum CJoliActions {
  LOAD_TOURNEYS = "LOAD_TOURNEYS",
  SELECT_TOURNEY = "SELECT_TOURNEY",
  LOAD_RANKING = "LOAD_RANKING",
  SELECT_DAY = "SELECT_DAY",
  LOAD_TOURNEY = "LOAD_TOURNEY",
  SET_COLOR = "SET_COLOR",
  SELECT_PAGE = "SELECT_PAGE",
}

export enum UserActions {
  LOAD_USER = "LOAD_USER",
  COUNT_USER = "COUNT_USER",
}

export * from "./CJoliAction";
export * from "./UserAction";
