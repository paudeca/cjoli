import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import HomePage from "../HomePage";
import { Route, Routes } from "react-router-dom";
import { Match, Tourney } from "../../models";
import WS from "jest-websocket-mock";

const url = import.meta.env.VITE_API_WS;

const renderHomePage = async ({
  uid,
  phaseId,
  path,
  initialPath,
  tourney,
}: {
  uid: string;
  phaseId: number;
  path: string;
  initialPath: string;
  tourney?: Tourney;
}) => {
  const get = mockGetRanking(
    uid,
    () =>
      tourney ??
      createTourney({
        id: 1,
        phases: [{ id: phaseId, name: "phase1", squads: [] }],
      })
  );
  await renderPage(
    <Routes>
      <Route path={path} element={<HomePage />} />
    </Routes>,
    initialPath
  );
  expect(get).toHaveBeenCalledTimes(1);
  screen.getByTestId("ranking");
  screen.getByTestId("matches");
  return { get };
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    WS.clean();
  });

  it("render", async () => {
    const uid = "123";
    const phaseId = 1;
    await renderHomePage({
      uid,
      phaseId,
      path: "/:uid",
      initialPath: `/${uid}`,
    });
  });

  it("renderPhase", async () => {
    const uid = "123";
    const phaseId = 1;
    await renderHomePage({
      uid,
      phaseId,
      path: "/:uid/:phaseId",
      initialPath: `/${uid}/${phaseId}`,
    });
  });

  it("refresh", async () => {
    const uid = "123";
    const phaseId = 1;
    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    const { get } = await renderHomePage({
      uid,
      phaseId,
      path: "/:uid",
      initialPath: `/${uid}`,
    });

    await server.connected;

    server.send({ type: "updateRanking" });
    expect(get).toHaveBeenCalledTimes(2);

    server.close();
  });

  it("ranking", async () => {
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
              matches: [{ done: true } as Match],
            },
          ],
        },
      ],
    });

    await renderHomePage({
      uid,
      phaseId,
      path: "/:uid",
      initialPath: `/${uid}`,
      tourney,
    });
    screen.getByTestId("rank");
  });
});
