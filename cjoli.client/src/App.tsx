import { Global, ThemeProvider, css } from "@emotion/react";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { CJoliProvider } from "./contexts/CJoliContext";

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
        `}
      />
      <CJoliProvider>
        <RouterProvider router={router} />
      </CJoliProvider>
    </ThemeProvider>
  );
};

export default App;
