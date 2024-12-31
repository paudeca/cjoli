import { beforeEach, describe, it, vi, expect, Mock, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createMatch,
  createRanking,
  createTeam,
  createTourney,
  mockGet,
  mockGetRanking,
  mockGetTourneys,
  mockGetUser,
  mockPost,
  renderPage,
  reset,
  setDesktop,
} from "../../__tests__/testUtils";
import MainPage from "../MainPage";
import { Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import { Team } from "../../models";
import HomePage from "../HomePage";
import dayjs from "dayjs";
import WS from "jest-websocket-mock";
import { act } from "react-dom/test-utils";

const url = import.meta.env.VITE_API_WS;

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (init) => {
  const mod = await init<typeof import("react-router-dom")>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

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
          {
            favoriteTeamId: 1,
            tourneyId: 1,
            useCustomEstimate: false,
            isAdmin: false,
          },
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

  return {
    check: () => {
      expect(get).toBeCalledTimes(calls.length);
    },
  };
};

describe("MainPage", async () => {
  beforeEach(() => {
    vi.resetAllMocks();
    reset();
  });
  afterEach(() => {
    WS.clean();
  });
  it("render", async () => {
    const uid = "123";
    const { check } = await renderMainPage({ uid });
    screen.getByText("content");
    check();
  });

  it("countUser", async () => {
    const uid = "123";
    const count = 12;
    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    const { check } = await renderMainPage({
      uid,
      element: <MainPage />,
    });
    screen.getByText("content");
    await server.connected;

    server.send({ type: "users", value: count });

    const countUser = await screen.getByTestId("countUser");
    expect(countUser.childNodes[0].textContent).toBe(`${count}`);

    server.close();
    check();
  });

  it("favoriteBlack", async () => {
    const uid = "123";
    const { check } = await renderMainPage({
      uid,
      page: <HomePage />,
      call: () =>
        mockGetRanking(
          uid,
          createTourney({
            id: 1,
            teams: [createTeam({ id: 1 })],
          })
        ),
    });
    check();
  });

  it("favoriteWhite", async () => {
    const uid = "123";
    const { check } = await renderMainPage({
      uid,
      page: <HomePage />,
      call: () =>
        mockGetRanking(
          uid,
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
    check();
  });

  it("nextMatch", async () => {
    const uid = "123";
    const phaseId = 1;

    const tourney = createTourney({
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
                createMatch({ time: dayjs().toDate() }),
                createMatch({ time: dayjs().add(2, "hour").toDate() }),
                createMatch({ time: dayjs().add(1, "hour").toDate() }),
              ],
            },
          ],
        },
      ],
    });

    const { check } = await renderMainPage({
      uid,
      page: <HomePage />,
      call: () => mockGetRanking(uid, tourney),
    });
    check();
  });

  it("scroll", async () => {
    const uid = "123";
    const phaseId = 1;
    const squadId = 1;
    global.scrollTo = vi.fn(() => {});

    const tourney = createTourney({
      id: 1,
      phases: [
        {
          id: phaseId,
          name: "phase1",
          squads: [
            {
              id: squadId,
              name: "squad1",
              positions: [],
              matches: [createMatch({ phaseId, squadId })],
            },
          ],
        },
      ],
    });

    const { check } = await renderMainPage({
      uid,
      page: <HomePage />,
      call: () => mockGetRanking(uid, tourney),
    });
    const scroll = screen.getByTestId("scroll");
    fireEvent.click(scroll);
    check();
    expect(global.scrollTo).toBeCalledTimes(1);
  });

  it("chat", async () => {
    const uid = "123";
    setDesktop();
    mockNavigate.mockImplementation((path: string) => {
      expect(path).toBe(`/${uid}/chat`);
    });
    const { check } = await renderMainPage({ uid });
    fireEvent.click(screen.getByText("Chat with BotAI"));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    check();
  });
  it("estimateButton", async () => {
    const uid = "123";
    const { check } = await renderMainPage({
      uid,
      call: () =>
        mockGet("updateEstimate", createRanking({}), "updateEstimate"),
    });
    mockPost("saveUserConfig", () => createRanking({}), "saveUserConfig");
    await act(async () => {
      fireEvent.click(screen.getByTestId("estimateBtn"));
    });
    screen.getByText("Estimate calculated");
    check();
  });
});
