import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import HomePage from "./pages/HomePage";
import { CJoliProvider } from "./contexts/CJoliContext";
import { ModalProvider } from "./contexts/ModalContext";
import { UserProvider } from "./contexts/UserContext";
//import HomePage from "./pages/HomePage";
//import SelectPage from "./pages/SelectPage";
import MainPage from "./pages/MainPage";
import { ToastProvider } from "./contexts/ToastContext";
//import RankPage from "./pages/RankPage";
//import ChatPage from "./pages/ChatPage";
import SettingPage from "./pages/SettingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useServer } from "./hooks/useServer";
//import TeamPage from "./pages/TeamPage";
//import AdminPage from "./pages/AdminPage";
//import GalleryPage from "./pages/GalleryPage";
//import CastPage from "./pages/CastPage";
import { Suspense, lazy } from "react";
import { MyProgressBar } from "./components/Loading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

const HomePage = lazy(() => import("./pages/HomePage"));
const SelectPage = lazy(() => import("./pages/SelectPage"));
const RankPage = lazy(() => import("./pages/RankPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const CastPage = lazy(() => import("./pages/CastPage"));
const GamePage = lazy(() => import("./pages/GamePage"));

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
          path: "team/:teamId",
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
          path: isUseDomain ? "fullcast" : ":uid/fullcast",
          element: <CastPage xl />,
        },
        {
          path: isUseDomain ? "gallery/:mode?" : ":uid/gallery/:mode?",
          element: <GalleryPage />,
        },
        {
          path: isUseDomain ? "game" : ":uid/game",
          element: <GamePage />,
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
              <Suspense fallback={<MyProgressBar />}>
                <RouterProvider router={router} />
              </Suspense>
            </QueryClientProvider>
          </ToastProvider>
        </UserProvider>
      </ModalProvider>
    </CJoliProvider>
  );
};

export default App;
