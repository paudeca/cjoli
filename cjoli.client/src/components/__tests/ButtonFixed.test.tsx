import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ButtonFixed from "../ButtonFixed";
import { beforeEach } from "node:test";
import { reset, setDesktop } from "../../__tests__/testUtils";

describe("ButtonFixed", () => {
  beforeEach(reset);
  it("mobile", () => {
    const { container } = render(<ButtonFixed>button</ButtonFixed>);
    expect(container.getElementsByClassName("start-0")).toHaveLength(1);
  });
  it("desktop", () => {
    setDesktop();
    const { container } = render(<ButtonFixed>button</ButtonFixed>);
    expect(container.getElementsByClassName("end-0")).toHaveLength(1);
  });
});
