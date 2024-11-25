import { beforeEach, describe, it, vi, expect, Mock, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import {
  createTourney,
  mockGetRanking,
  mockGetTourneys,
  mockGetUser,
  renderPage,
} from "../../__tests__/testUtils";
import MainPage from "../MainPage";
import { Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import { Match, Team } from "../../models";
import HomePage from "../HomePage";
import dayjs from "dayjs";
import WS from "jest-websocket-mock";

const url = import.meta.env.VITE_API_WS;

const renderMainPage = async ({
  uid,
  element,
  page,
  call,
}: {
  uid: string;
  element?: ReactNode;
  page?: ReactNode;
  call?: () => Mock;
}) => {
  const calls = [
    () =>
      mockGetUser({
        configs: [
          { favoriteTeamId: 1, tourneyId: 1, useCustomEstimate: false },
        ],
      }),
    () => mockGetTourneys(uid),
  ];
  if (call) calls.push(call);
  const gets = calls.map((c) => c());
  const get = gets[0];

  await renderPage(
    <Routes>
      <Route path="/" element={element ?? <MainPage />}>
        <Route path=":uid" element={page ?? <div>content</div>} />
      </Route>
    </Routes>,
    `/${uid}`
  );

  expect(get).toBeCalledTimes(calls.length);
};

describe("MainPage", async () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    WS.clean();
  });
  it("render", async () => {
    const uid = "123";
    await renderMainPage({ uid });
    screen.getByText("content");
  });

  it("countUser", async () => {
    const uid = "123";
    const count = 12;
    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    await renderMainPage({
      uid,
      element: <MainPage />,
    });
    screen.getByText("content");
    await server.connected;

    server.send({ type: "users", value: count });

    const countUser = await screen.getByTestId("countUser");
    expect(countUser.childNodes[0].textContent).toBe(`${count}`);

    server.close();
  });

  it("favoriteBlack", async () => {
    const uid = "123";
    await renderMainPage({
      uid,
      page: <HomePage />,
      call: () =>
        mockGetRanking(uid, () =>
          createTourney({
            id: 1,
            teams: [{ id: 1 } as Team],
          })
        ),
    });
  });

  it("favoriteWhite", async () => {
    const uid = "123";
    await renderMainPage({
      uid,
      page: <HomePage />,
      call: () =>
        mockGetRanking(uid, () =>
          createTourney({
            id: 1,
            teams: [
              {
                id: 1,
                primaryColor: "#ffffff",
                secondaryColor: "#000000",
              } as Team,
            ],
          })
        ),
    });
  });

  it("nextMatch", async () => {
    const uid = "123";
    const phaseId = 1;

    await renderMainPage({
      uid,
      page: <HomePage />,
      call: () =>
        mockGetRanking(uid, () =>
          createTourney({
            id: 1,
            phases: [
              {
                id: phaseId,
                name: "phase1",
                squads: [
                  {
                    id: 1,
                    name: "squad1",
                    positions: [],
                    matches: [
                      { time: dayjs().toDate() } as Match,
                      { time: dayjs().add(2, "hour").toDate() } as Match,
                      { time: dayjs().add(1, "hour").toDate() } as Match,
                    ],
                  },
                ],
              },
            ],
          })
        ),
    });
  });
});
