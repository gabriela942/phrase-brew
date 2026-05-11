// Lightweight typed wrapper around the GTM dataLayer.
//
// The dataLayer is injected by the inline snippet in index.html before the
// React bundle loads, so we only push to it here — never re-initialize.
// Configure GA4 / other tags inside the GTM container UI; this file just
// emits well-shaped events.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;
  pushDataLayer({
    event: "page_view",
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {}
): void {
  pushDataLayer({ event: name, ...params });
}
