import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

export function AppErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  // A missing page should never be indexed as content.
  useEffect(() => {
    if (!notFound) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

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
    <div className="min-h-screen bg-background px-6 py-16 text-foreground/90">
      <div className="mx-auto max-w-3xl border border-accent/38 bg-card/95 p-8">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          Interface Recovery
        </div>
        <h1 className="text-3xl text-foreground">{title}</h1>
        <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">{message}</p>
        {notFound ? (
          <a
            href="/"
            className="mt-6 inline-flex min-h-11 items-center border border-accent bg-accent px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Back to the portfolio
          </a>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 min-h-11 border border-accent bg-accent px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Reload
          </button>
        )}
      </div>
    </div>
  );
}
