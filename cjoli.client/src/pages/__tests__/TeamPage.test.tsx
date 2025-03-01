import {
  createPosition,
  createTeam,
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import TeamPage from "../TeamPage";
import { Route, Routes } from "react-router-dom";
import WS from "jest-websocket-mock";

const UID = "123";
const TEAM_NAME = "teamName";
const TEAM_ID = 1;

const url = import.meta.env.VITE_API_WS;

describe("TeamPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    WS.clean();
  });

  it("render", async () => {
    const tourney = createTourney({
      id: 1,
      teams: [createTeam({ id: TEAM_ID, name: TEAM_NAME })],
      phases: [
        {
          id: 1,
          name: "squad1",
          squads: [
            {
              id: 1,
              name: "squad1",
              positions: [createPosition({ id: 1, teamId: TEAM_ID })],
              matches: [],
            },
          ],
          events: [],
        },
      ],
    });
    mockGetRanking(UID, tourney);
    await renderPage(
      <Routes>
        <Route path="/:uid/:teamId" element={<TeamPage />} />
      </Routes>,
      `/${UID}/${TEAM_ID}`
    );
    screen.getAllByText(TEAM_NAME);
  });

  it("refresh", async () => {
    const tourney = createTourney({
      id: 1,
      teams: [createTeam({ id: TEAM_ID, name: TEAM_NAME })],
    });
    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    const get = mockGetRanking(UID, tourney);
    await renderPage(
      <Routes>
        <Route path="/:uid/:teamId" element={<TeamPage />} />
      </Routes>,
      `/${UID}/${TEAM_ID}`
    );
    screen.getAllByText(TEAM_NAME);

    await server.connected;

    server.send({ type: "updateRanking" });
    expect(get).toHaveBeenCalledTimes(2);
  });
});
