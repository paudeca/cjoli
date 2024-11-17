import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../HomePage";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import { Route, Routes } from "react-router-dom";

vi.mock("axios");

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
});
