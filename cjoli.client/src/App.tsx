import { Global, ThemeProvider, css } from "@emotion/react";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { CJoliProvider } from "./contexts/CJoliContext";
import { ModalProvider } from "./contexts/ModalContext";
import { UserProvider } from "./contexts/UserContext";

const theme = {
  colors: {
    primary: "#202644",
    secondary: "#932829",
  },
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/:uid",
    element: <HomePage />,
  },

]);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            background-color: #202644;
            color: white;
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
            --bs-progress-bar-bg: #932829;
          }
          .accordion-button {
            --bs-accordion-active-bg: #932829;
            &:not(collapsed) {
              --bs-accordion-active-color: white;
            }
          }
        `}
      />
      <CJoliProvider>
        <ModalProvider>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
        </ModalProvider>
      </CJoliProvider>
    </ThemeProvider>
  );
};

export default App;
