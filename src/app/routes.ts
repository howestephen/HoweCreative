import { createBrowserRouter } from "react-router";
import { createElement } from "react";
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
        path: "study",
        HydrateFallback: () => createElement("div", {
          role: "status",
          style: { position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: "#060707", color: "#b7bdb8", fontSize: 11 },
        }, createElement("span", { "aria-hidden": true, style: { width: 24, height: 24, border: "1px solid #ffffff26", borderTopColor: "#eceee5", borderRadius: "50%" } }), "Loading portrait"),
        lazy: async () => ({
          Component: (await import("./experience/PortraitExperience")).PortraitExperience,
        }),
      },
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
