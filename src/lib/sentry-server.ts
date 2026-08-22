import * as Sentry from "@sentry/cloudflare";

export function captureServerException(error: unknown) {
  Sentry.captureException(error);
}
