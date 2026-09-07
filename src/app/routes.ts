import { createBrowserRouter } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { CVRoute } from "./cv-route";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: AppErrorBoundary,
    children: [
      { index: true, Component: Home },
      {
        path: "work/:slug",
        lazy: async () => ({
          Component: (await import("./pages/Project")).Project,
        }),
      },
    ],
  },
  {
    // The CV is a standalone, print-ready page. Keeping it outside Layout also
    // lets the router load its career-history code only when /cv is requested.
    path: "/cv",
    Component: CVRoute,
    ErrorBoundary: AppErrorBoundary,
  },
]);
