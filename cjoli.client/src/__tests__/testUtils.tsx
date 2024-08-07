import React from "react";
import { render, act } from "@testing-library/react";
import { CJoliProvider } from "../contexts/CJoliContext";
import { UserProvider } from "../contexts/UserContext";
import { ToastProvider } from "../contexts/ToastContext";
import { ModalProvider } from "../contexts/ModalContext";
import { ThemeProvider } from "@emotion/react";
import { MemoryRouter } from "react-router-dom";
import { Ranking, Score, Tourney } from "../models";
import { expect, vi } from "vitest";
import axios from "axios";

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
              <ModalProvider>
                <MemoryRouter initialEntries={path ? [path] : undefined}>
                  {page}
                </MemoryRouter>
              </ModalProvider>
            </ToastProvider>
          </UserProvider>
        </CJoliProvider>
      </ThemeProvider>
    );
  });
};

export const createTourney = ({
  id,
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
  teams: [],
  config: { hasPenalty: false },
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
  rank: {},
});

export const mockGetRanking = (uid: string, create?: () => Tourney) => {
  const get = vi.mocked(axios.get).mockImplementationOnce((url) => {
    expect(url).toMatch(`${uid}/ranking`);
    const tourney = create ? create() : createTourney({ id: 1 });
    return Promise.resolve<{ data: Ranking }>({
      data: {
        tourney,
        /*tourney: {
          teams: [],
          phases: [{ id: 1, name: "phase1", squads: [] }],
          ranks: [],
        },*/
        scores: {
          scoreTeams: [],
          scoreSquads: [],
          scoreTourney: createScore(),
        },
        history: {},
      },
    });
  });
  return get;
};
