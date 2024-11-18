import { beforeEach, describe, it, vi, expect, Mock } from "vitest";
import { screen } from "@testing-library/react";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import MainPage from "../MainPage";
import axios from "axios";
import { Route, Routes } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { useServer } from "../../hooks/useServer";
import { Match, Team } from "../../models";
import HomePage from "../HomePage";
import dayjs from "dayjs";

vi.mock("axios");

const InitPage = ({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) => {
  const { sendMessage } = useServer();
  useEffect(() => {
    sendMessage({ type: "users", payload: count });
  }, [sendMessage, count]);
  return children;
};

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
      vi.mocked(axios.get).mockImplementationOnce((url) => {
        expect(url).toMatch(/user/);
        return Promise.resolve({
          data: {
            configs: [
              { favoriteTeamId: 1, tourneyId: 1, useCustomEstimate: false },
            ],
          },
        });
      }),
    () =>
      vi.mocked(axios.get).mockImplementationOnce((url) => {
        expect(url).toMatch(/tourneys/);
        return Promise.resolve({ data: [{ uid }] });
      }),
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
  it("render", async () => {
    const uid = "123";
    await renderMainPage({ uid });
    screen.getByText("content");
  });

  it("countUser", async () => {
    const uid = "123";
    const count = 12;
    await renderMainPage({
      uid,
      element: (
        <InitPage count={count}>
          <MainPage />
        </InitPage>
      ),
    });
    screen.getByText("content");

    const countUser = screen.getByTestId("countUser");
    expect(countUser.childNodes[0].textContent).toBe(`${count}`);
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
                      { time: dayjs().add(2, "days").toDate() } as Match,
                      { time: dayjs().add(1, "days").toDate() } as Match,
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
