import { fireEvent, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import SelectPage from "../SelectPage";
import { renderPage, createTourney } from "../../__tests__/testUtils";
import { useCJoli } from "../../hooks/useCJoli";
import React from "react";
import dayjs from "dayjs";
import { Tourney } from "../../models";
import { Route, Routes } from "react-router-dom";

const InitPage = ({
  tourneys,
  children,
}: {
  tourneys: Tourney[];
  children: React.ReactNode;
}) => {
  const { loadTourneys } = useCJoli();
  React.useEffect(() => {
    loadTourneys(tourneys);
  }, [loadTourneys, tourneys]);
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
    ];
    await renderPage(
      <InitPage tourneys={tourneys}>
        <SelectPage />
      </InitPage>
    );
    screen.getByText("name-1");
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
});
