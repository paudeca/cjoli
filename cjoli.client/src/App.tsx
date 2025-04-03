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
import { useServer } from "./hooks/useServer";
import TeamPage from "./pages/TeamPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import CastPage from "./pages/CastPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const App = () => {
  const { isUseDomain } = useServer();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainPage />,
      children: [
        { path: "", element: isUseDomain ? <HomePage /> : <SelectPage /> },
        {
          path: "admin",
          element: <AdminPage />,
        },
        {
          path: ":uid",
          element: <HomePage />,
        },
        {
          path: isUseDomain ? "ranking/:mode?" : ":uid/ranking/:mode?",
          element: <RankPage />,
        },
        {
          path: isUseDomain ? "phase/:phaseId" : ":uid/phase/:phaseId",
          element: <HomePage />,
        },
        {
          path: isUseDomain
            ? "phase/:phaseId/squad/:squadId"
            : ":uid/phase/:phaseId/squad/:squadId",
          element: <HomePage />,
        },
        {
          path: isUseDomain ? "team/:teamId" : ":uid/team/:teamId",
          element: <TeamPage />,
        },
        {
          path: isUseDomain
            ? "team/:teamId/phase/:phaseId"
            : ":uid/team/:teamId/phase/:phaseId",
          element: <TeamPage />,
        },
        { path: isUseDomain ? "chat" : ":uid/chat", element: <ChatPage /> },
        {
          path: isUseDomain ? "setting" : ":uid/setting",
          element: <SettingPage />,
        },
        {
          path: isUseDomain ? "cast" : ":uid/cast",
          element: <CastPage />,
        },
        {
          path: isUseDomain ? "gallery/:mode?" : ":uid/gallery/:mode?",
          element: <GalleryPage />,
        },
      ],
    },
  ]);

  return (
    <CJoliProvider>
      <ModalProvider>
        <UserProvider>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </ToastProvider>
        </UserProvider>
      </ModalProvider>
    </CJoliProvider>
  );
};

export default App;
