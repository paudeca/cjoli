import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import HomePage from "../HomePage";
import { Route, Routes } from "react-router-dom";
import { useServer } from "../../hooks/useServer";
import { ReactNode, useEffect } from "react";
import { Match, Tourney } from "../../models";

vi.mock("axios");

const InitPage = ({ children }: { children: ReactNode }) => {
  const { sendMessage } = useServer();
  useEffect(() => {
    sendMessage({ type: "updateRanking" });
  }, [sendMessage]);
  return children;
};

const renderHomePage = async ({
  uid,
  phaseId,
  path,
  initialPath,
  element,
  tourney,
}: {
  uid: string;
  phaseId: number;
  path: string;
  initialPath: string;
  element?: ReactNode;
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
      <Route path={path} element={element ?? <HomePage />} />
    </Routes>,
    initialPath
  );
  expect(get).toHaveBeenCalledTimes(1);
  screen.getByTestId("ranking");
  screen.getByTestId("matches");
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    await renderHomePage({
      uid,
      phaseId,
      path: "/:uid",
      initialPath: `/${uid}`,
      element: (
        <InitPage>
          <HomePage />
        </InitPage>
      ),
    });
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
      element: <HomePage />,
      tourney,
    });
    screen.getByTestId("rank");
  });
});
