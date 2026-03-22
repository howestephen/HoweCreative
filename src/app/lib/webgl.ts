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

    return Boolean(context);
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
