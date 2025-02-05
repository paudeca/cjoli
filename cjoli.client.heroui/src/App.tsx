import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import { useConfig } from "@cjoli/core";
import { Progress } from "@heroui/react";

function App() {
  const { isLoaded } = useConfig();
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
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
    </Routes>
  );
}

export default App;
