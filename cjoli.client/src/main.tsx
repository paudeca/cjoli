import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./i18n.ts";

import "moment/dist/locale/fr";
import "moment/dist/locale/pt";
import "moment/dist/locale/es";
import "moment/dist/locale/de";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
