import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRanking,
  createTeam,
  createTourney,
  createUser,
  initPage,
  renderPage,
  reset,
  setDesktop,
} from "../../../__tests__/testUtils";
import TeamStack from "../TeamStack";
import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { useCJoli } from "../../../hooks/useCJoli";
import { useEffect } from "react";
import { useUser } from "../../../hooks/useUser";
import { Team } from "../../../models";
import dayjs from "dayjs";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (init) => {
  const mod = await init<typeof import("react-router-dom")>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

const render = async (team?: Team) => {
  const tourney = createTourney({
    id: 1,
    teams: [team ?? createTeam({ id: 1 }), createTeam({ id: 2 })],
  });
  const ranking = createRanking({ tourney, history: { 1: [] } });

  const Page = initPage(TeamStack, () => {
    const { loadRanking } = useCJoli();
    const { loadUser } = useUser();
    useEffect(() => {
      loadRanking(ranking);
      loadUser(createUser({ role: "ADMIN" }));
    }, [loadRanking, loadUser]);
  });
  await renderPage(
    <Routes>
      <Route path="/:teamId" element={<Page />} />
    </Routes>,
    "/1"
  );
  screen.getAllByText("team1");
};

describe("TeamStack", () => {
  beforeEach(reset);
  it("render", async () => {
    await render();
  });
  it("youngest", async () => {
    await render(createTeam({ id: 1, youngest: dayjs().format() }));
  });

  it("desktop", async () => {
    setDesktop();
    await render();
  });
  it("noTeam", async () => {
    await renderPage(<TeamStack />);
    screen.getByText("No team found");
  });
  it("timeline", async () => {
    await render();
    fireEvent.click(screen.getByText("Timeline"));
  });
  it("general", async () => {
    await render();
    fireEvent.click(screen.getByText("General"));
  });
  /*it("selectTeamB", async () => {
    await render();

    const TEAM2 = "team2";
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: TEAM2 } });

    const items = screen.getAllByText(TEAM2);
    fireEvent.click(items[0]);

    screen.getAllByText(TEAM2);
  });*/

  it("back", async () => {
    mockNavigate.mockImplementation((path: number) => {
      expect(path).toBe(-1);
    });
    await render();
    fireEvent.click(screen.getByText("Back"));
    expect(mockNavigate).toBeCalledTimes(1);
  });

  it("edit", async () => {
    await render();
    fireEvent.click(screen.getByText("Edit"));
    screen.getByText("Name");
  });
});
