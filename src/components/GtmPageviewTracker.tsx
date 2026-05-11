import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/gtm";

// Pushes a `page_view` event to the GTM dataLayer on every React Router
// navigation. The initial render also fires this — that becomes the first
// page_view, so configure the GA4 tag in GTM to trigger on the custom
// `page_view` event (NOT on "All Pages"), otherwise the initial load is
// double-counted.
export function GtmPageviewTracker(): null {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
