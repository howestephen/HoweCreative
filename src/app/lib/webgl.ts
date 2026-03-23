import { useEffect, useState } from "react";

function detectWebGLSupport() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("experimental-webgl");

    if (!context) return false;

    // Immediately release the test context so it doesn't count against
    // iOS Safari's 8-context limit.
    const ext = (context as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    ext?.loseContext();

    return true;
  } catch {
    return false;
  }
}

export function useWebGLAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(detectWebGLSupport());
  }, []);

  return isAvailable;
}
