import { describe, it, vi } from "vitest";
import {
  createRanking,
  createTourney,
  mockGetRanking,
  renderPage,
} from "../../../__tests__/testUtils";
import MatchesStack from "../MatchesStack";
import { Match } from "../../../models";
import React, { ReactNode } from "react";
import { useCJoli } from "../../../hooks/useCJoli";

vi.mock("axios");

const Load = ({ children }: { children: ReactNode }) => {
  const { loadRanking } = useCJoli();
  React.useEffect(() => {
    loadRanking(
      createRanking(() =>
        createTourney({
          id: 1,
          phases: [
            {
              id: 1,
              name: "phase1",
              squads: [
                {
                  id: 1,
                  name: "squad1",
                  positions: [],
                  matches: [{ id: 1, squadId: 1 } as Match],
                },
              ],
            },
          ],
        })
      )
    );
  }, [loadRanking]);
  return children;
};

describe("MatchesStack", () => {
  it("render", async () => {
    //const phase = { id: 1, name: "name", squads: [] };
    const uid = "123";
    mockGetRanking(uid, () =>
      createTourney({
        id: 1,
        phases: [
          {
            id: 1,
            name: "phase1",
            squads: [
              {
                id: 1,
                name: "squad1",
                positions: [],
                matches: [
                  {
                    id: 1,
                  } as Match,
                ],
              },
            ],
          },
        ],
      })
    );
    await renderPage(
      <Load>
        <MatchesStack />
      </Load>
    );
  });
});
