export function getSentryDsn(): string | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN;
  return dsn && dsn.trim() !== "" ? dsn : undefined;
}
