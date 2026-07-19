import { Moon, Sun } from "lucide-react";

import { applyTheme, useIsDark } from "../lib/theme";

export function ThemeToggle() {
  const isDark = useIsDark();

  return (
    <button
      type="button"
      onClick={() => applyTheme(!isDark)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="pointer-events-auto inline-flex h-[58px] w-[58px] items-center justify-center border border-accent/35 bg-background/85 text-foreground shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md transition-colors hover:border-accent/60 hover:text-accent"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
