// Sentry stub — @sentry/react is not installed in this project.
// Replace with real implementation after `bun add @sentry/react`.
export function initSentry() {}
export const Sentry = {
  captureException: (_err: unknown) => {},
  captureMessage: (_msg: string) => {},
};
