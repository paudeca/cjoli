import { Route, Routes } from "react-router-dom";
import { useBootstrap, CJoliServer } from "@/lib/core";

import { HomePage, SelectPage } from "./pages";
import { CJoliLoading } from "./components/cjoli-loading";
import { DefaultLayout } from "./pages/layouts/default-layout";

const App = () => {
  const { loaded } = useBootstrap();
  console.log("App");
  return (
    <CJoliLoading loading={!loaded}>
      <Routes>
        <Route element={<DefaultLayout />} path="/">
          <Route element={<SelectPage />} path="/" />
          <Route element={<HomePage />} path=":uid" />
          <Route element={<HomePage />} path="/:uid/phase/:phaseId" />
          <Route
            element={<HomePage />}
            path="/:uid/phase/:phaseId/squad/:squadId"
          />
          <Route element={<div>team</div>} path="/:uid/team/:teamId" />
        </Route>
      </Routes>
      <CJoliServer />
    </CJoliLoading>
  );
};

export default App;
