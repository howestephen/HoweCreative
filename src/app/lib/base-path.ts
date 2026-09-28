/**
 * The redesign is published at howecreative.co.uk/particle-redesign, proxied
 * from its own Vercel project, and also runs at the root of that project's
 * own address. Links and the router use this prefix so both work.
 */
export const BASE_PATH =
  typeof window !== "undefined" && window.location.pathname.startsWith("/particle-redesign")
    ? "/particle-redesign"
    : "";

export const withBase = (path: string) => `${BASE_PATH}${path}`;
