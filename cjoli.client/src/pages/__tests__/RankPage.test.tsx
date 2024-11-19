import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../__tests__/testUtils";
import RankPage from "../RankPage";
import { Route, Routes } from "react-router-dom";
import WS from "jest-websocket-mock";

vi.mock("axios");
vi.mock("react-chartjs-2");

const url = import.meta.env.VITE_API_WS;

describe("RankPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    WS.clean();
  });
  it("render", async () => {
    const uid = "123";
    const get = mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        ranks: [
          {
            id: 1,
            order: 1,
            phaseId: 1,
            squadId: 1,
            value: 1,
            name: "rank-name",
          },
        ],
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
  });

  it("updateRanking", async () => {
    const uid = "123";
    const get = mockGetRanking(uid);

    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    await renderPage(
      <Routes>
        <Route path="/:uid" element={<RankPage />} />
      </Routes>,
      `/${uid}`
    );
    await server.connected;

    server.send({ type: "updateRanking" });
    expect(get).toHaveBeenCalledTimes(2);

    server.close();
  });
});
