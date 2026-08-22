import * as Sentry from "@sentry/react";
import { getSentryDsn } from "./sentry-config";

if (typeof window !== "undefined") {
  const dsn = getSentryDsn();
  if (dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: import.meta.env.PROD ? "production" : "development",
    });
  }
}

export { Sentry };
