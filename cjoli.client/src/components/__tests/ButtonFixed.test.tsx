import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ButtonFixed from "../ButtonFixed";

describe("ButtonFixed", () => {
  it("mobile", () => {
    const { container } = render(<ButtonFixed>button</ButtonFixed>);
    expect(container.getElementsByClassName("start-0")).toHaveLength(1);
  });
  it("desktop", () => {
    global.innerWidth = 1200;
    const { container } = render(<ButtonFixed>button</ButtonFixed>);
    expect(container.getElementsByClassName("end-0")).toHaveLength(1);
  });
});
