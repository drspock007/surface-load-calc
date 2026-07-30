import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "@/lib/analytics";
import { hasMeasurementConsent } from "@/lib/privacyChoices";

/** Initializes GA4 (only with consent) and sends a page_view on every route change. */
export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (hasMeasurementConsent()) initAnalytics();
  }, []);

  useEffect(() => {
    if (!hasMeasurementConsent()) return;
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
