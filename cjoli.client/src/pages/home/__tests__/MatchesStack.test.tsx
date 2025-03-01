import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMatch,
  createRanking,
  createTourney,
  initPage,
  renderPage,
} from "../../../__tests__/testUtils";
import MatchesStack from "../MatchesStack";
import { TourneyConfig, UserMatch } from "../../../models";
import { useEffect } from "react";
import { useCJoli } from "../../../hooks/useCJoli";
import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import dayjs from "dayjs";

const PHASE_ID = 1;
const SQUAD_ID = 1;
const SQUAD_ID2 = 2;

const tourney = createTourney({
  id: 1,
  config: { hasForfeit: true } as TourneyConfig,
  phases: [
    {
      id: PHASE_ID,
      name: "phase1",
      squads: [
        {
          id: SQUAD_ID,
          name: "squad1",
          positions: [],
          matches: [1, 2, 3].map((i) =>
            createMatch({
              id: i,
              phaseId: PHASE_ID,
              squadId: SQUAD_ID,
              location: `loc${i % 2}`,
              time: dayjs().add(1, "hour").toDate(),
            })
          ),
        },
        {
          id: SQUAD_ID2,
          name: "squad2",
          positions: [],
          matches: [
            createMatch({
              id: 4,
              phaseId: PHASE_ID,
              squadId: SQUAD_ID2,
              location: "loc0",
              shot: true,
              time: dayjs().add(1, "day").toDate(),
            }),
            createMatch({
              id: 5,
              phaseId: PHASE_ID,
              squadId: SQUAD_ID2,
              location: "loc1",
              userMatch: {} as UserMatch,
              time: dayjs().add(1, "day").toDate(),
            }),
          ],
        },
      ],
      events: [],
    },
  ],
});

//const ranking = createRanking({ tourney });

/*const clearMatch = async (check: (data: Match) => Ranking) =>
  runMatch(check, "clearMatch");
const saveMatch = async (check: (data: Match) => Ranking) =>
  runMatch(check, "saveMatch");
*/
/*const runMatch = async (check: (data: Match) => Ranking, postName: string) => {
  const phase = { id: 1, name: "name", squads: [] };

  const post = mockPost<Match, Ranking>(postName, check, "saveMatch");

  const Page = initPage(MatchesStack, () => {
    const { loadRanking } = useCJoli();
    const { loadUser } = useUser();
    useEffect(() => {
      loadRanking(ranking);
      loadUser(createUser({}));
    }, [loadRanking, loadUser]);
  });
  await renderPage(<Page phase={phase} />);

  return {
    post,
    save: async () => {
      //save: async (_matchId: number, _mockCall: number) => {
      //TODO to fix
      /*const button = screen.getByTestId(`btn-m${matchId}`);
      await act(async () => {
        fireEvent.click(button);
      });
      expect(post).toHaveBeenCalledTimes(mockCall);
    },
  };
};*/

describe("MatchesStack", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("render", async () => {
    const phase = { id: 1, name: "name", squads: [], events: [] };
    const Page = initPage(MatchesStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(createRanking({ tourney }));
      }, [loadRanking]);
    });
    await renderPage(<Page phase={phase} />);
    screen.getByTestId("matches");
    screen.getByTestId("match-4");
  });

  it("filterSquad", async () => {
    const phase = { id: 1, name: "name", squads: [], events: [] };
    const Page = initPage(MatchesStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(createRanking({ tourney }));
      }, [loadRanking]);
    });

    await renderPage(
      <Routes>
        <Route path="/:squadId" element={<Page phase={phase} />} />
      </Routes>,
      `/${SQUAD_ID}`
    );
    screen.getByTestId("matches");
    screen.getByTestId("match-3");
    expect(screen.queryByTestId("match-4")).toBeNull();
  });

  //TODO to fix
  /*it("saveMatch", async () => {
    const { save } = await saveMatch((data) => {
      expect(data.scoreA).toBe("1");
      expect(data.scoreB).toBe("0");
      return ranking;
    });

    const scoreA = screen.getByTestId(`m1.scoreA`);
    fireEvent.change(scoreA, { target: { value: 1 } });
    const scoreB = screen.getByTestId(`m1.scoreB`);
    fireEvent.change(scoreB, { target: { value: 0 } });

    await save(1, 1);
  });*/

  it("noScore", async () => {
    /*const { save } = await saveMatch((data) => {
      expect(data.scoreA).toBe(0);
      expect(data.scoreB).toBe(0);
      return ranking;
    });
    await save(1, 1);*/
  });

  it("forfeit", async () => {
    /*const { post } = await saveMatch((data) => {
      expect(data.scoreA).toBe(0);
      expect(data.scoreB).toBe(0);
      expect(data.forfeitB).toBeTruthy();
      return ranking;
    });*/
    //TODO to fix
    /*const forfeitB = screen.getByTestId(`m1.scoreB.forfeit`);
    await act(() => {
      fireEvent.click(forfeitB);
    });
    expect(post).toHaveBeenCalledTimes(1);*/
  });

  it("shot", async () => {
    ///const { save } = await saveMatch(() => ranking);
    ///await save(4, 0);
  });

  it("clearMatch", async () => {
    ///const { save } = await clearMatch(() => ranking);
    ///await save(5, 1);
  });

  it("selectDay", async () => {
    const phase = { id: 1, name: "name", squads: [], events: [] };
    const Page = initPage(MatchesStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(createRanking({ tourney }));
      }, [loadRanking]);
    });

    await renderPage(<Page phase={phase} />);
    const key = dayjs().add(1, "day").format("YYYY-MM-DD");
    const item = screen.getByTestId(key);
    fireEvent.click(item.querySelector("button")!);
  });
});
