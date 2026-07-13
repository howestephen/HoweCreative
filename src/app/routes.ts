import { createBrowserRouter } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { CV } from "./pages/CV";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: AppErrorBoundary,
    children: [
      { index: true, Component: Home }
    ]
  },
  {
    // Sits outside the dark Layout route on purpose: the CV is a standalone,
    // print-ready white-background page and must not inherit the site's
    // loading screen, side nav, WebGL backdrop, or dark chrome.
    path: "/cv",
    Component: CV,
    ErrorBoundary: AppErrorBoundary
  }
]);
