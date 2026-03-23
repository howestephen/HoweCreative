/**
 * iOS Safari is strict about GPU memory and multiple WebGL contexts.
 * Decorative rain backdrops use CSS instead of R3F on these devices to avoid tab crashes.
 */
export function isIOSLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPadOS 13+ desktop UA: MacIntel + touch
  if (navigator.maxTouchPoints > 1 && /MacIntel/.test(navigator.platform)) {
    return true;
  }
  return false;
}
