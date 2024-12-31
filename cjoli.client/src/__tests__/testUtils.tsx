/* eslint-disable max-lines */
import { JSX, ComponentType, ReactNode } from "react";
import { render, act } from "@testing-library/react";
import { CJoliProvider } from "../contexts/CJoliContext";
import { UserProvider } from "../contexts/UserContext";
import { ToastProvider } from "../contexts/ToastContext";
import { ModalProvider } from "../contexts/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  Match,
  Ranking,
  Score,
  Team,
  Tourney,
  User,
  Position,
  Rank,
  Phase,
  Squad,
} from "../models";
import { expect, vi } from "vitest";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

vi.mock("axios");
vi.mock("react-chartjs-2");

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

//fix error TypeError: targetWindow.matchMedia is not a function
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: object) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

export const reset = () => {
  setMobile();
};

export const setDesktop = () => {
  global.innerWidth = 1200;
};
export const setMobile = () => {
  global.innerWidth = 800;
};

export const renderPageWithRoute = (uid: string, page: ReactNode) => {
  return renderPage(
    <Routes>
      <Route path="/:uid" element={page} />
    </Routes>,
    `/${uid}`
  );
};
export const renderPage = (page: ReactNode, path?: string) => {
  return act(async () => {
    return render(
      <ThemeProvider
        theme={{ colors: { primary: "primary", secondary: "secondary" } }}
      >
        <CJoliProvider>
          <UserProvider>
            <ToastProvider>
              <QueryClientProvider client={new QueryClient()}>
                <ModalProvider>
                  <MemoryRouter initialEntries={path ? [path] : undefined}>
                    {page}
                  </MemoryRouter>
                </ModalProvider>
              </QueryClientProvider>
            </ToastProvider>
          </UserProvider>
        </CJoliProvider>
      </ThemeProvider>
    );
  });
};

export const createTourney = ({
  id,
  teams,
  phases,
  ranks,
  startTime,
  endTime,
  config,
}: Partial<Tourney> & { id: number }) => ({
  id,
  uid: `uid-${id}`,
  name: `name-${id}`,
  season: "season",
  category: "cat",
  startTime: startTime ?? new Date(),
  endTime: endTime ?? new Date(),
  phases: phases ?? [],
  ranks: ranks ?? [],
  teams: teams ?? [],
  config: config ?? {
    hasPenalty: false,
    hasForfeit: false,
    win: 2,
    neutral: 1,
    loss: 0,
    forfeit: 0,
  },
  rule: "simple",
});

export const createScore: () => Score = () => ({
  teamId: 0,
  positionId: 0,
  game: 0,
  total: 0,
  win: 0,
  neutral: 0,
  loss: 0,
  goalFor: 0,
  goalAgainst: 0,
  goalDiff: 0,
  shutOut: 0,
  penalty: 0,
  time: new Date(),
  rank: 1,
  ranks: {},
  sources: {},
});

export const createRanking = (ranking: Partial<Ranking>) => {
  const tourney = ranking.tourney ?? createTourney({ id: 1 });
  return {
    tourney,
    scores: {
      scoreTeams: [],
      scoreSquads: [],
      scoreTourney: createScore(),
    },
    history: ranking.history ?? {},
  };
};

export const createTeam: (team: Partial<Team> & { id: number }) => Team = (
  team
) =>
  ({
    id: team.id,
    name: team.name ?? `team${team.id}`,
    youngest: team.youngest,
  }) as Team;

export const createPhase: (phase: Partial<Phase> & { id: number }) => Phase = (
  phase
) => ({
  id: phase.id,
  name: phase.name ?? `phase${phase.id}`,
  squads: phase.squads ?? [],
});

export const createSquad: (squad: Partial<Squad> & { id: number }) => Squad = (
  squad
) => ({
  id: squad.id,
  name: squad.name ?? `squad${squad.id}`,
  positions: squad.positions ?? [],
  matches: squad.matches ?? [],
});

export const createPosition: (
  position: Partial<Position> & { id: number }
) => Position = (position) =>
  ({ id: position.id, teamId: position.teamId ?? 0 }) as Position;

export const createRank: (rank: Partial<Rank> & { id: number }) => Rank = (
  rank
) =>
  ({
    id: rank.id,
  }) as Rank;

export const createUser: (user: Partial<User>) => User = (user) => ({
  id: user.id ?? 1,
  login: user.login ?? "login",
  password: user.password ?? "password",
  role: user.role,
});

export const createMatch: (match: Partial<Match>) => Match = (match) =>
  ({
    id: match.id ?? 1,
    done: match.done ?? false,
    scoreA: match.scoreA ?? 0,
    scoreB: match.scoreB ?? 0,
    positionA: match.positionA ?? 0,
    positionIdA: match.positionIdA ?? 0,
    positionIdB: match.positionIdB ?? 0,
    positionB: match.positionB ?? 0,
    phaseId: match.phaseId ?? 0,
    squadId: match.squadId ?? 0,
    location: match.location,
    shot: match.shot ?? false,
    time: match.time,
    userMatch: match.userMatch,
  }) as Match;

export const mockGet = <T,>(uri: string, data: T, name: string) => {
  const get = vi.mocked(axios.get).mockImplementationOnce((url) => {
    try {
      expect(url).toMatch(uri);
      return Promise.resolve({
        data,
      });
    } catch (error) {
      console.error(`Error in ${name}`, error);
      throw error;
    }
  });
  return get;
};

export const mockPost = <T, R = T>(
  uri: string,
  check: (data: T) => R,
  name: string
) => {
  const post = vi.mocked(axios.post).mockImplementationOnce((url, data) => {
    try {
      expect(url).toMatch(uri);
      data = check(data as T);
      return Promise.resolve({
        data,
      });
    } catch (error) {
      console.error(`Error in ${name}`, error);
      throw error;
    }
  });
  return post;
};

export const mockDelete = <T,>(
  uri: string,
  callback: () => T,
  name: string
) => {
  const del = vi.mocked(axios.delete).mockImplementationOnce((url) => {
    try {
      expect(url).toMatch(uri);
      const data = callback();
      return Promise.resolve({
        data,
      });
    } catch (error) {
      console.error(`Error in ${name}`, error);
      throw error;
    }
  });
  return del;
};

export const mockGetRanking = (uid: string, tourney?: Partial<Tourney>) =>
  mockGet(
    `${uid}/ranking`,
    createRanking({
      tourney: (tourney as Tourney) ?? createTourney({ id: 1 }),
    }),
    "mockGetRanking"
  );

export const mockGetUser = (user: Partial<User>) =>
  mockGet("user", user, "mockGetUser");

export const mockGetTourneys = (uid: string) =>
  mockGet("tourneys", [{ uid }], "mockGetTourneys");

export const mockGetTeams = (teams: Team[]) =>
  mockGet("teams", teams, "mockGetTeams");

export const initPage = <T extends JSX.IntrinsicAttributes, P = Partial<T>>(
  Component: ComponentType<T>,
  init: () => P
) => {
  const component = (props: Omit<T, keyof P>) => {
    const p = init();
    return <Component {...(props as T)} {...p} />;
  };
  return component;
};
