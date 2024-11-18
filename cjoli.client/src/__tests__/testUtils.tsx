import React from "react";
import { render, act } from "@testing-library/react";
import { CJoliProvider } from "../contexts/CJoliContext";
import { UserProvider } from "../contexts/UserContext";
import { ToastProvider } from "../contexts/ToastContext";
import { ModalProvider } from "../contexts/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { MemoryRouter } from "react-router-dom";
import { Ranking, Score, Tourney, User } from "../models";
import { expect, vi } from "vitest";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import duration from "dayjs/plugin/duration";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

const registers: Record<string, (value: object) => void> = {};
vi.mock("../hooks/useServer", () => ({
  useServer: () => ({
    register: (type: string, c: () => void) => {
      registers[type] = c;
    },
    sendMessage: (msg: { type: string; payload: object }) => {
      registers[msg.type] && registers[msg.type](msg.payload);
    },
  }),
}));

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

export const renderPage = (page: React.ReactNode, path?: string) => {
  return act(async () => {
    render(
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
  config: {
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

export const createRanking = (create?: () => Tourney) => {
  const tourney = create ? create() : createTourney({ id: 1 });
  return {
    tourney,
    scores: {
      scoreTeams: [],
      scoreSquads: [],
      scoreTourney: createScore(),
    },
    history: {},
  };
};

export const createUser: (user: Partial<User>) => User = (user) => ({
  login: user.login ?? "login",
  password: user.password ?? "password",
  role: user.role,
});

export const mockGetRanking = (uid: string, create?: () => Tourney) => {
  const get = vi.mocked(axios.get).mockImplementationOnce((url) => {
    expect(url).toMatch(`${uid}/ranking`);
    return Promise.resolve<{ data: Ranking }>({
      data: createRanking(create),
    });
  });
  return get;
};
