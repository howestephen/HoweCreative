import { createBrowserRouter } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: AppErrorBoundary,
    children: [
      { index: true, Component: Home }
    ]
  }
]);
