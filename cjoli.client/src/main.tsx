import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./i18n.ts";
import { StrictMode } from "react";

import "dayjs/locale/fr";
import "dayjs/locale/pt";
import "dayjs/locale/es";
import "dayjs/locale/de";
import "dayjs/locale/nl";
import "dayjs/locale/fi";
import "dayjs/locale/cs";

import dayjs from "dayjs";
dayjs.locale("fr");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
