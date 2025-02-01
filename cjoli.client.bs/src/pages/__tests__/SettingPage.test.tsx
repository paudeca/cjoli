/* eslint-disable max-lines */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMatch,
  createPosition,
  createRank,
  createTeam,
  createTourney,
  mockDelete,
  mockGetRanking,
  mockGetTeams,
  mockGetTourneys,
  mockGetUser,
  mockPost,
  renderPage,
  renderPageWithRoute,
  reset,
  setDesktop,
} from "../../__tests__/testUtils";
import SettingPage from "../SettingPage";
import { act, fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import MainPage from "../MainPage";
import { Tourney } from "../../models";

const UID = "123";
const TEAM = "team1";
const PHASE = "phase1";
const SQUAD = "squad1";
const POSITION = "position1";
const TEAM_ID = 1;
const PHASE_ID = 1;
const SQUAD_ID = 1;
const POSITION_ID = 1;
const MATCH_ID = 1;
const RANK_ID = 1;

const render = async ({
  tourney,
  check,
  init,
  del,
}: {
  tourney: Tourney;
  check?: (data: Tourney) => Tourney;
  init?: () => void;
  del?: { path: string; name: string };
}) => {
  mockGetUser({ role: "ADMIN" });
  mockGetTourneys(UID);
  mockGetRanking(UID, tourney);
  init && init();

  const mockAxios = del
    ? mockDelete<Tourney>(del.path, () => tourney, del.name)
    : mockPost<Tourney>(
        "tourney",
        check ? check : (data) => data,
        "saveTourney"
      );

  await renderPage(
    <Routes>
      <Route path="/" element={<MainPage />}>
        <Route path=":uid/setting" element={<SettingPage />} />
      </Route>
    </Routes>,
    `/${UID}/setting`
  );

  screen.getByText("Tourney");

  const open = async ({ btn, testId }: { btn?: string; testId?: string }) => {
    const btns = testId
      ? screen.getAllByTestId(testId)
      : screen.getAllByText(btn!);
    await act(() => {
      fireEvent.click(btns[0]);
    });
  };

  return {
    save: async () => {
      const btns = screen.getAllByText("Save");
      await act(() => {
        fireEvent.submit(btns[0]);
      });
      expect(mockAxios).toHaveBeenCalledTimes(1);
      screen.getByText("Tourney updated");
    },
    submit: async () => {
      const submit = screen.getByText("Submit");
      await act(async () => {
        fireEvent.submit(submit);
      });
      expect(mockAxios).toHaveBeenCalledTimes(1);
      screen.getByText("Tourney updated");
    },
    open,
    text: async ({
      label,
      value,
      btn,
      testId,
    }: {
      label?: string;
      value: string;
      btn?: string;
      testId?: string;
    }) => {
      btn && (await open({ btn }));
      const input = testId
        ? screen.getByTestId(testId)
        : screen.getByLabelText(label!);
      fireEvent.change(input, { target: { value } });
    },
    select: async (btn: string, value: string) => {
      await open({ btn });

      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value } });

      const items = screen.getAllByText(value);
      fireEvent.click(items[0]);
    },
    yes: async (btn: string) => {
      await open({ testId: btn });

      const yes = screen.getAllByText("Yes");
      await act(async () => {
        fireEvent.click(yes[0]);
      });
      expect(mockAxios).toHaveBeenCalledTimes(1);
    },
  };
};

const deleteItem = async (path: string, name: string, btn: string) => {
  const tourney = createTourney({
    id: 1,
    teams: [createTeam({ id: TEAM_ID })],
    phases: [
      {
        id: PHASE_ID,
        name: "phase1",
        squads: [
          {
            id: SQUAD_ID,
            name: "squad1",
            positions: [createPosition({ id: POSITION_ID, teamId: TEAM_ID })],
            matches: [createMatch({ id: MATCH_ID })],
          },
        ],
      },
    ],
    ranks: [createRank({ id: RANK_ID })],
  });

  const { yes } = await render({
    tourney,
    del: {
      path,
      name,
    },
  });

  await yes(btn);
};

describe("SettingPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    reset();
  });
  it("render", async () => {
    mockGetRanking(UID);
    await renderPageWithRoute(UID, <SettingPage />);
    screen.getByText("Tourney");
  });

  it("waiting", async () => {
    await renderPageWithRoute(UID, <SettingPage />);
    expect(screen.queryByText("Tourney")).toBeNull();
  });

  it("desktop", async () => {
    setDesktop();
    mockGetRanking(UID);
    await renderPageWithRoute(UID, <SettingPage />);
    screen.getByText("Tourney");
  });

  it("save", async () => {
    const tourney = createTourney({ id: 1 });
    const NAME = "newName";
    const { save, text } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.name).toBe(NAME);
        return tourney;
      },
    });
    await text({ label: "Name", value: NAME });

    await save();
  });

  it("addTeam", async () => {
    const tourney = createTourney({ id: 1 });
    const { submit, select } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.teams[0].name).toBe(TEAM);
        return tourney;
      },
      init: () => mockGetTeams([createTeam({ id: 1, name: TEAM })]),
    });

    await select("Add Team", TEAM);
    await submit();
  });

  it("addPhase", async () => {
    const tourney = createTourney({ id: 1 });
    const { submit, text } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.phases[0].name).toBe(PHASE);
        return tourney;
      },
    });

    await text({ label: "Phase Name", value: PHASE, btn: "Add Phase" });

    await submit();
  });

  it("addSquad", async () => {
    const tourney = createTourney({
      id: 1,
      phases: [1, 2].map((i) => ({ id: i, name: `phase${i}`, squads: [] })),
    });

    const { submit, text } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.phases[0].squads[0].name).toBe(SQUAD);
        return tourney;
      },
    });

    await text({ label: "Squad Name", value: SQUAD, btn: "Add Squad" });

    await submit();
  });

  it("addPosition", async () => {
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

    const { submit, text } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.phases[0].squads[0].positions[0].name).toBe(POSITION);
        tourney.phases[0].squads[0].positions[0].id = 1;
        return tourney;
      },
    });

    await text({
      testId: "positionName",
      value: POSITION,
      btn: "Add Position",
    });

    await submit();
  });

  it("addMatch", async () => {
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

    const { submit, open } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.phases[0].squads[0].matches[0].time).toBeDefined();
        tourney.phases[0].squads[0].matches[0].id = 1;
        return tourney;
      },
    });

    await open({ btn: "Add Match" });

    await submit();
  });

  it("addRank", async () => {
    const tourney = createTourney({ id: 1 });

    const { submit, open } = await render({
      tourney,
      check: (tourney) => {
        expect(tourney.ranks[0].order).toBe(1);
        tourney.ranks[0].id = 1;
        return tourney;
      },
    });

    await open({ btn: "Add Rank" });

    await submit();
  });

  it("deleteTourney", async () => {
    await deleteItem(`tourney/${UID}`, "removeTourney", "deleteTourney");
  });

  it("deleteTeam", async () => {
    await deleteItem(
      `tourney/${UID}/teams/${TEAM_ID}`,
      "removeTeam",
      "deleteTeam"
    );
  });

  it("deletePhase", async () => {
    await deleteItem(
      `tourney/${UID}/phases/${PHASE_ID}`,
      "removePhase",
      "deletePhase"
    );
  });

  it("deleteSquad", async () => {
    await deleteItem(
      `tourney/${UID}/phases/${PHASE_ID}/squads/${SQUAD_ID}`,
      "removeSquad",
      "deleteSquad"
    );
  });

  it("deletePosition", async () => {
    await deleteItem(
      `tourney/${UID}/phases/${PHASE_ID}/squads/${SQUAD_ID}/positions/${POSITION_ID}`,
      "removePosition",
      "deletePosition"
    );
  });

  it("deleteMatch", async () => {
    await deleteItem(
      `tourney/${UID}/phases/${PHASE_ID}/squads/${SQUAD_ID}/matches/${MATCH_ID}`,
      "removeMatch",
      "deleteMatch"
    );
  });

  it("deleteRank", async () => {
    await deleteItem(
      `tourney/${UID}/ranks/${RANK_ID}`,
      "removeRank",
      "deleteRank"
    );
  });
});
