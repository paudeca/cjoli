import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTourney,
  mockDelete,
  mockGetRanking,
  mockGetTeams,
  mockGetTourneys,
  mockGetUser,
  mockPost,
  renderPage,
  renderPageWithRoute,
} from "../../__tests__/testUtils";
import SettingPage from "../SettingPage";
import { act, fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import MainPage from "../MainPage";
import axios from "axios";
import { Match, Position, Rank, Team, Tourney } from "../../models";

describe("SettingPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("render", async () => {
    const uid = "123";
    mockGetRanking(uid);
    await renderPageWithRoute(uid, <SettingPage />);
    screen.getByText("Tourney");
  });

  it("waiting", async () => {
    const uid = "123";
    await renderPageWithRoute(uid, <SettingPage />);
    expect(screen.queryByText("Tourney")).toBeNull();
  });

  it("desktop", async () => {
    const uid = "123";
    window.innerWidth = 1200;
    mockGetRanking(uid);
    await renderPageWithRoute(uid, <SettingPage />);
    screen.getByText("Tourney");
  });

  it("save", async () => {
    const uid = "123";
    const tourney = createTourney({ id: 1 });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    vi.mocked(axios.post).mockImplementationOnce(() => {
      return Promise.resolve({ data: tourney });
    });

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );

    screen.getByText("Tourney");

    const btns = screen.getAllByText("Save");
    await act(() => {
      fireEvent.submit(btns[0]);
    });
    screen.getByText("Tourney updated");
  });

  it("addTeam", async () => {
    const uid = "123";
    const tourney = createTourney({
      id: 1,
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);
    const TEAM = "team1";
    mockGetTeams([{ id: 1, name: TEAM } as Team]);

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.teams[0].name).toBe(TEAM);
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Team");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: TEAM } });

    const items = screen.getAllByText(TEAM);
    fireEvent.click(items[0]);

    const submit = screen.getByText("Submit");
    await act(async () => {
      fireEvent.submit(submit);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("addPhase", async () => {
    const uid = "123";
    const tourney = createTourney({
      id: 1,
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);
    const PHASE = "phase1";

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.phases[0].name).toBe(PHASE);
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Phase");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const input = screen.getByLabelText("Phase Name");
    fireEvent.change(input, { target: { value: PHASE } });

    const submit = screen.getByText("Submit");
    await act(async () => {
      fireEvent.submit(submit);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("addSquad", async () => {
    const uid = "123";
    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({ id: i, name: `phase${i}`, squads: [] })),
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);
    const SQUAD = "squad1";

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.phases[0].squads[0].name).toBe(SQUAD);
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Squad");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const input = screen.getByLabelText("Squad Name");
    fireEvent.change(input, { target: { value: SQUAD } });

    const submit = screen.getByText("Submit");
    await act(async () => {
      fireEvent.submit(submit);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("addPosition", async () => {
    const uid = "123";

    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({
        id: i,
        name: `phase${i}`,
        squads: [1, 2].map((j) => ({
          id: j,
          name: `squad${j}`,
          positions: [],
          matches: [],
        })),
      })),
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const POSITION = "position1";

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.phases[0].squads[0].positions[0].name).toBe(POSITION);
        data.phases[0].squads[0].positions[0].id = 1;
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Position");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const input = screen.getByTestId("positionName");
    fireEvent.change(input, { target: { value: POSITION } });

    const submit = screen.getAllByText("Submit");
    await act(async () => {
      fireEvent.submit(submit[0]);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("addMatch", async () => {
    const uid = "123";

    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({
        id: i,
        name: `phase${i}`,
        squads: [1, 2].map((j) => ({
          id: j,
          name: `squad${j}`,
          positions: [],
          matches: [],
        })),
      })),
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.phases[0].squads[0].matches[0].time).toBeDefined();
        data.phases[0].squads[0].matches[0].id = 1;
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Match");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const submit = screen.getAllByText("Submit");
    await act(async () => {
      fireEvent.submit(submit[0]);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("addRank", async () => {
    const uid = "123";

    const tourney = createTourney({
      id: 1,
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const post = mockPost<Tourney>(
      "tourney",
      (data) => {
        expect(data.ranks[0].order).toBe(1);
        data.ranks[0].id = 1;
        return data;
      },
      "saveTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByText("Add Rank");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const submit = screen.getAllByText("Submit");
    await act(async () => {
      fireEvent.submit(submit[0]);
    });

    screen.getByText("Tourney updated");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("deleteTourney", async () => {
    const uid = "123";

    const tourney = createTourney({
      id: 1,
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(`tourney/${uid}`, () => {}, "removeTourney");

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deleteTourney");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getByText("Yes");
    await act(async () => {
      fireEvent.click(yes);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deleteTeam", async () => {
    const uid = "123";

    const TEAMID = 1;
    const tourney = createTourney({
      id: 1,
      teams: [{ id: TEAMID, name: "team1" } as Team],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/teams/${TEAMID}`,
      () => {
        return {
          ...tourney,
          teams: tourney.teams.filter((t) => t.id != TEAMID),
        };
      },
      "removeTourney"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deleteTeam");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[1]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deletePhase", async () => {
    const uid = "123";

    const PHASE_ID = 1;
    const tourney = createTourney({
      id: 1,
      phases: [{ id: PHASE_ID, name: "phase1", squads: [] }],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/phases/${PHASE_ID}`,
      () => {
        return tourney;
      },
      "removePhase"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deletePhase");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[0]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deleteSquad", async () => {
    const uid = "123";

    const PHASE_ID = 1;
    const SQUAD_ID = 1;
    const tourney = createTourney({
      id: 1,
      phases: [
        {
          id: PHASE_ID,
          name: "phase1",
          squads: [
            { id: SQUAD_ID, name: "squad1", positions: [], matches: [] },
          ],
        },
      ],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/phases/${PHASE_ID}/squads/${SQUAD_ID}`,
      () => {
        return tourney;
      },
      "removeSquad"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deleteSquad");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[0]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deletePosition", async () => {
    const uid = "123";

    const TEAM_ID = 1;
    const PHASE_ID = 1;
    const SQUAD_ID = 1;
    const POSITION_ID = 1;
    const tourney = createTourney({
      id: 1,
      teams: [{ id: TEAM_ID } as Team],
      phases: [
        {
          id: PHASE_ID,
          name: "phase1",
          squads: [
            {
              id: SQUAD_ID,
              name: "squad1",
              positions: [{ id: POSITION_ID, teamId: TEAM_ID } as Position],
              matches: [],
            },
          ],
        },
      ],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/phases/${PHASE_ID}/squads/${SQUAD_ID}/positions/${POSITION_ID}`,
      () => {
        return tourney;
      },
      "removePosition"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deletePosition");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[0]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deleteMatch", async () => {
    const uid = "123";

    const TEAM_ID = 1;
    const PHASE_ID = 1;
    const SQUAD_ID = 1;
    const MATCH_ID = 1;
    const tourney = createTourney({
      id: 1,
      teams: [{ id: TEAM_ID } as Team],
      phases: [
        {
          id: PHASE_ID,
          name: "phase1",
          squads: [
            {
              id: SQUAD_ID,
              name: "squad1",
              positions: [],
              matches: [{ id: MATCH_ID } as Match],
            },
          ],
        },
      ],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/phases/${PHASE_ID}/squads/${SQUAD_ID}/matches/${MATCH_ID}`,
      () => {
        return tourney;
      },
      "removeMatch"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deleteMatch");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[0]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });

  it("deleteRank", async () => {
    const uid = "123";

    const RANK_ID = 1;
    const tourney = createTourney({
      id: 1,
      ranks: [{ id: RANK_ID } as Rank],
    });
    mockGetUser({});
    mockGetTourneys(uid);
    mockGetRanking(uid, () => tourney);

    const del = mockDelete<void>(
      `tourney/${uid}/ranks/${RANK_ID}`,
      () => {
        return tourney;
      },
      "removeRank"
    );

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid/setting" element={<SettingPage />} />
        </Route>
      </Routes>,
      `/${uid}/setting`
    );
    screen.getByText("Tourney");

    const btns = screen.getAllByTestId("deleteRank");
    await act(() => {
      fireEvent.click(btns[0]);
    });

    const yes = screen.getAllByText("Yes");
    await act(async () => {
      fireEvent.click(yes[0]);
    });

    expect(del).toHaveBeenCalledTimes(1);
  });
});
