import type { Category } from "@/data/store";

const FILTER_EVENT = "mdw:filter";

/** Lets any component (e.g. the hero tags) switch the collection filter and scroll to it. */
export function showCategory(category: Category | "all") {
  window.dispatchEvent(new CustomEvent<Category | "all">(FILTER_EVENT, { detail: category }));
  document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
}

export function onShowCategory(handler: (category: Category | "all") => void) {
  const listener = (e: Event) => handler((e as CustomEvent<Category | "all">).detail);
  window.addEventListener(FILTER_EVENT, listener);
  return () => window.removeEventListener(FILTER_EVENT, listener);
}
