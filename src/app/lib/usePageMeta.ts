import { useEffect } from "react";

const ORIGIN = "https://howecreative.co.uk";

export type PageMeta = {
  title: string;
  description: string;
  /** Path and query on the site, such as "/archive" or "/?study=quiver". */
  path: string;
};

type Slot = { selector: string; create: () => HTMLElement; attr: string };

function slot(tag: "meta" | "link", key: string, value: string, attr: string): Slot {
  return {
    selector: `${tag}[${key}="${value}"]`,
    attr,
    create: () => {
      const el = document.createElement(tag);
      el.setAttribute(key, value);
      return el;
    },
  };
}

/** Sets the title, description, canonical and Open Graph tags for the current
 *  route, and puts back whatever the page had before when it unmounts. The
 *  tags in index.html describe the home page and stay the fallback. */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const url = ORIGIN + path;
    const updates: [Slot, string][] = [
      [slot("meta", "name", "description", "content"), description],
      [slot("link", "rel", "canonical", "href"), url],
      [slot("meta", "property", "og:url", "content"), url],
      [slot("meta", "property", "og:title", "content"), title],
      [slot("meta", "property", "og:description", "content"), description],
      [slot("meta", "name", "twitter:title", "content"), title],
      [slot("meta", "name", "twitter:description", "content"), description],
    ];

    const previousTitle = document.title;
    document.title = title;

    const undo = updates.map(([s, value]) => {
      let el = document.head.querySelector<HTMLElement>(s.selector);
      const created = !el;
      if (!el) {
        el = s.create();
        document.head.appendChild(el);
      }
      const before = el.getAttribute(s.attr);
      el.setAttribute(s.attr, value);
      return () => {
        if (created) el.remove();
        else if (before !== null) el.setAttribute(s.attr, before);
      };
    });

    return () => {
      document.title = previousTitle;
      for (const restore of undo.reverse()) restore();
    };
  }, [title, description, path]);
}
