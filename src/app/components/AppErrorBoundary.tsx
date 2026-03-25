import { isRouteErrorResponse, useRouteError } from "react-router";

export function AppErrorBoundary() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Interface Error";
  const message =
    isRouteErrorResponse(error)
      ? error.data?.message || "The page failed while rendering."
      : error instanceof Error
        ? error.message
        : "Something went wrong while rendering the portfolio.";

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-16 text-zinc-200">
      <div className="mx-auto max-w-3xl border border-[#ff003c]/38 bg-black/95 p-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff003c]">
          Interface Recovery
        </div>
        <h1 className="text-3xl text-white">{title}</h1>
        <p className="mt-4 font-mono text-sm leading-relaxed text-zinc-400">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 border border-[#ff003c] bg-[#ff003c] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-black"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
