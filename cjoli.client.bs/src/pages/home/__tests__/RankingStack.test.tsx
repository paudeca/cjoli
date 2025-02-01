import { describe, expect, it } from "vitest";
import {
  createRanking,
  createTourney,
  initPage,
  renderPage,
} from "../../../__tests__/testUtils";
import RankingStack from "../RankingStack";
import { fireEvent, screen } from "@testing-library/react";
import { useCJoli } from "../../../hooks/useCJoli";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

const phase = { id: 1, name: "name", squads: [] };

describe("RankingStack", () => {
  it("render", async () => {
    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({ id: i, name: `phase${i}`, squads: [] })),
    });
    const ranking = createRanking({ tourney });
    const Page = initPage(RankingStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(ranking);
      }, [loadRanking]);
    });
    await renderPage(<Page phase={phase} />);
    screen.getByText("phase1");
    screen.getByText("phase2");
  });

  it("filterSquad", async () => {
    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({ id: i, name: `phase${i}`, squads: [] })),
    });
    const ranking = createRanking({ tourney });
    const Page = initPage(RankingStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(ranking);
      }, [loadRanking]);
    });
    await renderPage(
      <Routes>
        <Route path="/:phaseId/:squadId" element={<Page phase={phase} />} />
      </Routes>,
      "/1/1"
    );
    screen.getByText("phase1");
    expect(screen.queryByText("phase2")).toBeNull();
  });

  it("selectPhase", async () => {
    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({ id: i, name: `phase${i}`, squads: [] })),
    });
    const ranking = createRanking({ tourney });
    const Page = initPage(RankingStack, () => {
      const { loadRanking } = useCJoli();
      useEffect(() => {
        loadRanking(ranking);
      }, [loadRanking]);
    });
    await renderPage(<Page phase={phase} />);
    fireEvent.click(screen.getByText("phase2"));
  });
});
