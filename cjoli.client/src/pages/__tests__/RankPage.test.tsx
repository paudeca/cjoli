import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RankPage from "../RankPage";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import { Route, Routes } from "react-router-dom";

vi.mock("axios");
vi.mock("react-chartjs-2");

describe("RankPage", () => {
  it("render", async () => {
    const uid = "123";
    const get = mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        ranks: [{ id: 1, order: 1, squadId: 1, value: 1, name: "rank-name" }],
      })
    );

    await renderPage(
      <Routes>
        <Route path="/:uid" element={<RankPage />} />
      </Routes>,
      `/${uid}`
    );
    expect(get).toHaveBeenCalledTimes(1);
    screen.getByText("rank-name");
  });

  it("changeType", async () => {
    const uid = "123";
    mockGetRanking(uid);

    await renderPage(
      <Routes>
        <Route path="/:uid" element={<RankPage />} />
      </Routes>,
      `/${uid}`
    );
    const option = screen.getByTestId<HTMLOptionElement>("game");
    expect(option.selected).toBeFalsy();
    fireEvent.change(screen.getByTestId("select"), {
      target: { value: "game" },
    });
    expect(option.selected).toBeTruthy();
    screen.debug();
  });
});
