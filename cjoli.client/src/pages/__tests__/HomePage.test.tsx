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
import { Match } from "../../models";

vi.mock("axios");

const InitPage = ({ children }: { children: ReactNode }) => {
  const { sendMessage } = useServer();
  useEffect(() => {
    sendMessage({ type: "updateRanking" });
  }, [sendMessage]);
  return children;
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("render", async () => {
    const uid = "123";
    const phaseId = 1;
    const get = mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        phases: [{ id: phaseId, name: "phase1", squads: [] }],
      })
    );
    await renderPage(
      <Routes>
        <Route path="/:uid" element={<HomePage />} />
      </Routes>,
      `/${uid}`
    );
    expect(get).toHaveBeenCalledTimes(1);
    screen.getByTestId("ranking");
    screen.getByTestId("matches");
    const team = await screen.queryByText("No team found");
    expect(team).toBeNull();
  });

  it("renderPhase", async () => {
    const uid = "123";
    const phaseId = 1;
    const get = mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        phases: [{ id: phaseId, name: "phase1", squads: [] }],
      })
    );
    await renderPage(
      <Routes>
        <Route path="/:uid/:phaseId" element={<HomePage />} />
      </Routes>,
      `/${uid}/${phaseId}`
    );
    expect(get).toHaveBeenCalledTimes(1);
    screen.getByTestId("ranking");
    screen.getByTestId("matches");
    const team = await screen.queryByText("No team found");
    expect(team).toBeNull();
  });

  it("refresh", async () => {
    const uid = "123";
    const phaseId = 1;

    const get = mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        phases: [{ id: phaseId, name: "phase1", squads: [] }],
      })
    );

    await renderPage(
      <Routes>
        <Route
          path="/:uid"
          element={
            <InitPage>
              <HomePage />
            </InitPage>
          }
        />
      </Routes>,
      `/${uid}`
    );

    expect(get).toHaveBeenCalledTimes(1);
  });

  it("ranking", async () => {
    const uid = "123";
    const phaseId = 1;

    const get = mockGetRanking(uid, () =>
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
                matches: [{ done: true } as Match],
              },
            ],
          },
        ],
      })
    );

    await renderPage(
      <Routes>
        <Route path="/:uid" element={<HomePage />} />
      </Routes>,
      `/${uid}`
    );
    expect(get).toHaveBeenCalledTimes(1);
    screen.getByTestId("rank");
  });
});
