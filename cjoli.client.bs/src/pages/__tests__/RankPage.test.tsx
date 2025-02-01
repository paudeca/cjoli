import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockGetRanking, renderPageWithRoute } from "../../__tests__/testUtils";
import RankPage from "../RankPage";
import WS from "jest-websocket-mock";

const url = import.meta.env.VITE_API_WS;

describe("RankPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    WS.clean();
  });

  //TODO to fix
  /*it("render", async () => {
    const uid = "123";
    const get = mockGetRanking(
      uid,
      createTourney({
        id: 1,
        ranks: [
          {
            id: 1,
            teamId: 1,
            order: 1,
            phaseId: 1,
            squadId: 1,
            value: 1,
            name: "rank-name",
          },
        ],
      })
    );

    await renderPageWithRoute(uid, <RankPage />);
    expect(get).toHaveBeenCalledTimes(1);
    screen.getByText("rank-name");
  });*/

  //TODO to fix
  /*it("changeType", async () => {
    const uid = "123";
    mockGetRanking(uid);

    await renderPageWithRoute(uid, <RankPage />);
    const option = screen.getByTestId<HTMLOptionElement>("game");
    expect(option.selected).toBeFalsy();
    fireEvent.change(screen.getByTestId("select"), {
      target: { value: "game" },
    });
    expect(option.selected).toBeTruthy();
  });*/

  it("updateRanking", async () => {
    const uid = "123";
    const get = mockGetRanking(uid);

    const server = new WS(`${url}/server/ws`, { jsonProtocol: true });

    await renderPageWithRoute(uid, <RankPage />);
    await server.connected;

    server.send({ type: "updateRanking" });
    expect(get).toHaveBeenCalledTimes(2);

    server.close();
  });
});
