import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SelectPage from "../SelectPage";
import {
  renderPage,
  createTourney,
  createUser,
} from "../../__tests__/testUtils";
import { useCJoli } from "../../hooks/useCJoli";
import React, { useEffect } from "react";
import dayjs from "dayjs";
import { Tourney, User } from "../../models";
import { Route, Routes } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import axios from "axios";

vi.mock("axios");

const InitPage = ({
  tourneys,
  user,
  children,
}: {
  tourneys: Tourney[];
  user?: User;
  children: React.ReactNode;
}) => {
  const { loadTourneys } = useCJoli();
  const { loadUser } = useUser();

  useEffect(() => {
    loadTourneys(tourneys);
    user && loadUser(user);
  }, [loadTourneys, tourneys, user, loadUser]);
  return children;
};

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
    await renderPage(
      <InitPage tourneys={tourneys}>
        <SelectPage />
      </InitPage>
    );

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

    await renderPage(
      <InitPage tourneys={tourneys}>
        <Routes>
          <Route path="" element={<SelectPage />} />
          <Route path="uid-1" element={<div>uid-1</div>} />
        </Routes>
      </InitPage>
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

    await renderPage(
      <InitPage tourneys={tourneys} user={user}>
        <Routes>
          <Route path="" element={<SelectPage />} />
          <Route path="uid-1" element={<div>uid-1</div>} />
        </Routes>
      </InitPage>
    );

    const btn = await screen.getByText("New Tourney");
    fireEvent.click(btn);

    const input = await screen.getByLabelText("Id");
    fireEvent.change(input, { target: { value: uid } });

    const submit = await waitFor(() => screen.getByText("Submit"));
    await act(() => {
      fireEvent.click(submit);
    });

    expect(post).toHaveBeenCalled();
  });
});
