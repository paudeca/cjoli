import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { initPage, renderPage } from "../../__tests__/testUtils";
import ChatPage from "../ChatPage";
import { act, fireEvent, screen } from "@testing-library/react";
import WS from "jest-websocket-mock";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../../hooks/useUser";

let server: WS;

const url = import.meta.env.VITE_API_WS;

const InitChat = initPage(ChatPage, () => {
  const { loadUser } = useUser();
  useEffect(() => {
    loadUser({ login: "login", password: "" });
  }, [loadUser]);
});

const renderChatPage = async ({ uid }: { uid: string }) => {
  const welcome = "welcome";
  server = new WS(`${url}/chat/${uid}/ws`);
  server.on("connection", () => {
    server.send(welcome);
  });

  const { container } = await renderPage(
    <Routes>
      <Route path="/:uid" element={<InitChat />}></Route>
    </Routes>,
    `/${uid}`
  );
  await server.connected;

  screen.getByText("BotAI");
  screen.getByText(welcome);

  const close = screen.getByText("Close");
  fireEvent.click(close);

  return { container };
};

describe("ChatPage", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    server.close();
    WS.clean();
  });
  it("render", async () => {
    const uid = "123";
    await renderChatPage({ uid });
  });

  it("desktop", async () => {
    global.innerWidth = 1200;

    const uid = "123";
    await renderChatPage({ uid });
  });

  it("sendMessage", async () => {
    const uid = "123";
    const { container } = await renderChatPage({ uid });

    const message = "message";
    const input = container.querySelector("input[name='message']");
    fireEvent.change(input, { target: { value: message } });

    const send = screen.getByText("Send");
    await act(() => {
      fireEvent.submit(send);
    });
    await server.nextMessage;
    screen.getByText(message);
  });
});
