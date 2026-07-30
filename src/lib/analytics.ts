// Google Analytics (GA4) initialization, loaded only after visitor consent.
// Measurement ID comes from the Lovable Google Analytics connector.
const MEASUREMENT_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as
  | string
  | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Injects the gtag.js script once and configures GA4. */
export const initAnalytics = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
};

/** Sends a page_view event; no-op when analytics was never initialized. */
export const trackPageView = (path: string) => {
  if (!initialized || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: path });
};
