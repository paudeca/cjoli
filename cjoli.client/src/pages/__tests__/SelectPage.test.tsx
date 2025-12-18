import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  renderPage,
  createTourney,
  createUser,
  initPage,
  mockGetTeams,
} from "../../__tests__/testUtils";
import SelectPage from "../SelectPage";
import { useCJoli } from "../../hooks/useCJoli";
import { useEffect } from "react";
import dayjs from "dayjs";
import { Tourney } from "../../models";
import { Route, Routes } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import axios from "axios";

describe("SelectPage", () => {
  it("render", async () => {
    const tourneys = [
      createTourney({ id: 1 }),
      createTourney({
        id: 2,
        startTime: dayjs().add(1, "days").toDate(),
        endTime: dayjs().add(2, "days").toDate(),
      }),
      createTourney({
        id: 3,
        startTime: dayjs().add(-1, "days").toDate(),
        endTime: dayjs().add(1, "days").toDate(),
      }),
      createTourney({
        id: 4,
        startTime: dayjs().add(3, "days").toDate(),
        endTime: dayjs().add(4, "days").toDate(),
      }),
      createTourney({
        id: 5,
        startTime: dayjs().add(2, "days").toDate(),
        endTime: dayjs().add(3, "days").toDate(),
      }),
    ];

    const InitSelectPage = initPage(SelectPage, () => {
      const { loadTourneys } = useCJoli();
      useEffect(() => {
        loadTourneys(tourneys);
      }, [loadTourneys]);
    });

    mockGetTeams([]);

    await renderPage(<InitSelectPage />);

    const t2 = screen.getByText("name-2");
    const t4 = screen.getByText("name-4");
    const t5 = screen.getByText("name-5");

    //check order of tourney in future
    expect(t2.compareDocumentPosition(t5)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(t5.compareDocumentPosition(t4)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("selectTourney", async () => {
    const tourneys = [createTourney({ id: 1 })];

    const InitSelectPage = initPage(SelectPage, () => {
      const { loadTourneys } = useCJoli();
      useEffect(() => {
        loadTourneys(tourneys);
      }, [loadTourneys]);
    });

    mockGetTeams([]);

    await renderPage(
      <Routes>
        <Route path="" element={<InitSelectPage />} />
        <Route path="uid-1" element={<div>uid-1</div>} />
      </Routes>
    );
    const div = screen.getByText("name-1");
    fireEvent.click(div);
    await screen.getByText("uid-1");
  });

  it("addTourney", async () => {
    const tourneys = [createTourney({ id: 1 })];
    const user = createUser({ role: "ADMIN" });

    const uid = "123";
    const post = vi.mocked(axios.post).mockImplementationOnce((_url, data) => {
      expect((data as Tourney).uid).toBe("123");
      return Promise.resolve();
    });

    const InitSelectPage = initPage(SelectPage, () => {
      const { loadTourneys } = useCJoli();
      const { loadUser } = useUser();

      useEffect(() => {
        loadTourneys(tourneys);
        user && loadUser(user);
      }, [loadTourneys, loadUser]);
    });

    mockGetTeams([]);

    await renderPage(
      <Routes>
        <Route path="" element={<InitSelectPage />} />
        <Route path="uid-1" element={<div>uid-1</div>} />
      </Routes>
    );

    const btn = screen.getByText("New Tourney");
    fireEvent.click(btn);

    const input = screen.getByLabelText("Id");
    fireEvent.change(input, { target: { value: uid } });

    const submit = screen.getByText("Submit");
    await act(() => {
      fireEvent.click(submit);
    });

    expect(post).toHaveBeenCalled();
  });
});
