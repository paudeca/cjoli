import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTourney,
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
import { Team, Tourney } from "../../models";

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
});
