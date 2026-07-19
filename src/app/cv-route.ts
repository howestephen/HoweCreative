import {
  Suspense,
  createElement,
  lazy,
  type ComponentType,
} from "react";

type CVModule = { CV: ComponentType };
type CVImporter = () => Promise<CVModule>;

function CVRouteFallback() {
  return createElement(
    "main",
    {
      className:
        "flex min-h-screen items-center justify-center bg-[#f6f3ec] px-6 text-[#191714]",
    },
    createElement(
      "p",
      { className: "font-mono text-xs uppercase tracking-[0.16em]", role: "status" },
      "Loading CV…",
    ),
  );
}

export function createCVRoute(
  importCV: CVImporter = () => import("./pages/CV"),
) {
  const LazyCV = lazy(async () => {
    const { CV } = await importCV();
    return { default: CV };
  });

  return function CVRoute() {
    return createElement(
      Suspense,
      { fallback: createElement(CVRouteFallback) },
      createElement(LazyCV),
    );
  };
}

export const CVRoute = createCVRoute();
