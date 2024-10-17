import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./i18n.ts";

import "moment/dist/locale/pt";
import "moment/dist/locale/es";
import "moment/dist/locale/de";
import "moment/dist/locale/fr";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
