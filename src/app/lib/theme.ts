import { useEffect, useState } from "react";

/** Apply a theme and persist the choice. The initial theme is set by the
 *  inline script in index.html before first paint (system preference unless
 *  the user has toggled). */
export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // private mode — theme still applies for this visit
  }
}

/** Reactive dark-mode flag driven by the `dark` class on <html>, so any
 *  toggle source (button, devtools, another tab) stays in sync. */
export function useIsDark(): boolean {
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setDark(el.classList.contains("dark"));
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
