import { Route, Routes } from "react-router-dom";
import { useServer } from "@cjoli/core";

import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import { useConfig } from "@cjoli/core";
import { Progress } from "@heroui/react";
import { HomePage, SelectPage } from "./pages";
import { CJoliLoading } from "./components/cjoli-loading";

const App = () => {
  const { isLoaded } = useConfig();
  const { getPath } = useServer();
  if (!isLoaded) {
    return (
      <Progress
        isIndeterminate
        aria-label="Loading..."
        size="sm"
        color="primary"
      />
    );
  }
  return (
    <CJoliLoading loading={!isLoaded}>
      <Routes>
        <Route element={<SelectPage />} path="/" />
        <Route element={<HomePage />} path="/:uid" />
        <Route element={<HomePage />} path="/:uid/phase/:phaseId" />
        <Route
          element={<HomePage />}
          path="/:uid/phase/:phaseId/squad/:squadId"
        />
        <Route element={<div>team</div>} path="/:uid/team/:teamId" />

        <Route element={<DocsPage />} path={getPath("/docs")} />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
      </Routes>
    </CJoliLoading>
  );
};

export default App;
