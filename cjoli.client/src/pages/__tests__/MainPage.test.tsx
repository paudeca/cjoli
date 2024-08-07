import { describe, it, vi, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderPage } from "../../__tests__/testUtils";
import MainPage from "../MainPage";
import axios from "axios";
import { Route, Routes } from "react-router-dom";

vi.mock("axios");

describe("MainPage", async () => {
  it("render", async () => {
    const get = vi.mocked(axios.get).mockImplementationOnce((url) => {
      expect(url).toMatch(/user/);
      return Promise.resolve({ data: {} });
    });
    vi.mocked(axios.get).mockImplementationOnce((url) => {
      expect(url).toMatch(/tourneys/);
      return Promise.resolve({ data: [{ uid: "123" }] });
    });

    await renderPage(
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":uid" element={<div>content</div>} />
        </Route>
      </Routes>,
      "/123"
    );

    screen.getByText("content");
    expect(get).toBeCalledTimes(2);
  });
});
