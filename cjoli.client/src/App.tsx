import { Global, ThemeProvider, css } from "@emotion/react";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { CJoliProvider } from "./contexts/CJoliContext";
import { ModalProvider } from "./contexts/ModalContext";
import { UserProvider } from "./contexts/UserContext";
import SelectPage from "./pages/SelectPage";
import MainPage from "./pages/MainPage";
import { ToastProvider } from "./contexts/ToastContext";
import RankPage from "./pages/RankPage";
import ChatPage from "./pages/ChatPage";
import SettingPage from "./pages/SettingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = {
  colors: {
    primary: "#202644",
    secondary: "#932829",
  },
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    children: [
      { path: "", element: <SelectPage /> },
      {
        path: ":uid",
        element: <HomePage />,
      },
      { path: ":uid/ranking", element: <RankPage /> },
      { path: ":uid/phase/:phaseId", element: <HomePage /> },
      { path: ":uid/phase/:phaseId/squad/:squadId", element: <HomePage /> },
      { path: ":uid/team/:teamId", element: <HomePage /> },
      { path: ":uid/team/:teamId/phase/:phaseId", element: <HomePage /> },
      { path: ":uid/chat", element: <ChatPage /> },
      { path: ":uid/setting", element: <SettingPage /> },
    ],
  },
]);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            background-color: ${theme.colors.primary};
            color: white;
            uuser-select: none;
          }
          input::placeholder {
            opacity: 0.5 !important;
          }
          span.badge.bg-secondary.menu {
            background-color: grey !important;
            opacity: 0.5;
          }
          .btn-primary {
            --bs-btn-bg: #313f69;
            --bs-btn-border-color: #313f69;
            --bs-btn-hover-bg: #2a365c;
            --bs-btn-hover-border-color: #2a365c;
            --bs-btn-active-bg: #394874;
            --bs-btn-active-border-color: #394874;
            --bs-btn-disabled-bg: #313f69;
          }
          .progress {
            --bs-progress-bar-bg: ${theme.colors.secondary};
          }
          .accordion-button {
            --bs-accordion-active-bg: ${theme.colors.secondary};
            &:not(collapsed),
            &:not(collapsed)::after {
              --bs-accordion-active-color: white;
              --bs-body-color: white;
            }
          }
          .bg-secondary {
            --bs-bg-opacity: 1;
            --bs-secondary-rgb: 120, 129, 169;
          }
          .form-check-input:checked {
            background-color: #313f69;
            border-color: #313f69;
          }

          .chat-messages {
            display: flex;
            flex-direction: column;
            max-height: 800px;
            overflow-y: scroll;
          }

          .chat-message-left,
          .chat-message-right {
            display: flex;
            flex-shrink: 0;
          }

          .chat-message-left {
            margin-right: auto;
          }

          .chat-message-right {
            flex-direction: row-reverse;
            margin-left: auto;
          }
        `}
      />
      <CJoliProvider>
        <ModalProvider>
          <UserProvider>
            <ToastProvider>
              <QueryClientProvider client={new QueryClient()}>
                <RouterProvider router={router} />
              </QueryClientProvider>
            </ToastProvider>
          </UserProvider>
        </ModalProvider>
      </CJoliProvider>
    </ThemeProvider>
  );
};

export default App;
